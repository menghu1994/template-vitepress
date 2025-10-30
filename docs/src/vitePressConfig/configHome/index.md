# 主页配置
> 文件配置路径`/docs/src/index.md`

```md
// 布局,默认是home,如果配置vue其他布局组件可以修改
layout: home

hero:
  // 标题
  name: VitePress Template
  // 副标题
  text: Keep writing.
  // 描述
  tagline: Looking in my eyes, Coding by yourself.
  // 右侧图片,静态图片地址/src/public/
  image:
    src: /img/vitepress-logo-large.svg
    alt: VitePress
  // 可选按钮
  actions:
    - theme: brand
      text:  快速部署 !
      link: /forkAndDeploy/部署博客/1.github page.html
    - theme: alt
      text: GitHub
      link: https://github.com/menghu1994/template-vitepress
// 可选卡片
features:
  - icon: 📝
    title: 什么是VitePress?
    link: https://vitepress.dev/zh/guide/what-is-vitepress
  - icon: 💨
    title: 一个大佬
    details: 精通各种吹牛
    link: https://github.com/menghu1994/template-vitepress
  - icon: 🚀
    title: 速度真的很快！
    details: SpringBoot,NestJS,Vue,React...
```
