姓名：名称：ChangElog

：
  pull_request：
    类型：
      -       标记
      -       未标记
      -       打开
      -       同步
      -       重新开放

工作：
  查看：
    如果：|
      ！
      ！
    运行：运行：ubuntu-l-lat
    步骤：
      -名称： - 名称：结帐分支
        用途：用途：action/checkout@v3
        和：
          提取深度：0

      -名称： - 名称：设置node.JS
        用途：用途：操作/设置节点@v3
        和：
          节点交换：节点交换：18。x

      -名称： - 名称：检查更改
        运行：运行：npx @changeets/cli状态-since =“原始/main”“原始/主”
