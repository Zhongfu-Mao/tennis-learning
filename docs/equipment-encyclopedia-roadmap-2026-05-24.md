# 网球装备百科主题路线图

日期：2026-05-24

目标：先把装备知识做成一个能独立浏览、收藏、复习的百科模块。它不是产品推荐清单，而是帮助用户理解“参数为什么影响上场体验”的知识卡体系。

## 当前状态

- 第一批 24 张已接入 Atlas，分布在 `equipment-foundations.json` 和 `equipment-extensions.json`。
- 第二批深挖内容已接入 `equipment-deep-dive.json`，当前装备百科共有 62 张结构化卡片。
- 62 张图片资源已加入 `image-manifest.json`；当前已有 62 张候选图，其中网球本体基础组 6 张、网球本体扩展组 5 张、球拍参数基础组 8 张、球拍深挖/改装组 6 张、球拍选购组 3 张、球线系统入门组 4 张、球线维护/搭配组 4 张、球线深挖组 8 张、握把深挖组 3 张、球鞋深挖组 5 张、配件与维护扩展组 4 张、握把/球鞋/配件/维护基础组 6 张，当前没有 `needs-generation`。
- 已通过内容校验测试，当前没有缺图引用、断裂卡片关系或重复 ID。
- 后续重点从“写卡片”切换为“生图、审图、落盘、批准”，直到形成可浏览、可收藏的装备百科图片模块。

## 主题规模

装备百科目标规模：60 张以上。当前结构化卡片为 62 张。

首批接入 Atlas：24 张，覆盖网球本体、球拍参数、球线系统、握把、球鞋和配件，形成可浏览的骨架。

后续扩展：38 张，补充更细的选购、维护、搭配和常见误区。

## 第一批 24 张

### A. 网球本体

1. `equipment.ball.pressurized`：压力球是什么
2. `equipment.ball.pressureless`：无压球适合什么训练
3. `equipment.ball.felt`：球毛如何影响速度和旋转
4. `equipment.ball.lifespan`：开罐后球为什么会衰减
5. `equipment.ball.surface`：不同场地为什么用球感不同

### B. 球拍参数

6. `equipment.racquet.head-size`：拍面大小与甜区
7. `equipment.racquet.weight`：静态重量不是全部
8. `equipment.racquet.balance`：平衡点决定头轻头重
9. `equipment.racquet.swingweight`：挥重才是挥起来的重量
10. `equipment.racquet.stiffness`：硬度 RA 与力量、舒适性
11. `equipment.racquet.beam`：拍框厚度与力量来源
12. `equipment.racquet.string-pattern`：线床密度与旋转、控制

### C. 球线系统

13. `equipment.string.poly`：聚酯线为什么控制强但费手
14. `equipment.string.synthetic-gut`：尼龙线为什么适合起步
15. `equipment.string.natural-gut-multi`：天然肠线和多股线的舒适性
16. `equipment.string.gauge`：线径影响耐用、旋转和手感
17. `equipment.string.tension`：磅数不是越高越控制
18. `equipment.string.hybrid`：混线为什么能折中

### D. 握把与手感

19. `equipment.grip.size`：手柄号怎么影响发力和放松
20. `equipment.grip.overgrip`：吸汗带不是装饰

### E. 网球鞋

21. `equipment.shoe.outsole`：硬地、红土、草地外底差异
22. `equipment.shoe.support`：支撑、缓震、耐磨怎么取舍

### F. 配件与维护

23. `equipment.accessory.dampener`：减震器到底改变什么
24. `equipment.maintenance.match-log`：装备日志如何帮你少走弯路

## 第二批 38 张

### 网球本体扩展

- 比赛球 vs 训练球
- 高海拔球
- 冷热天气对球压的影响
- 新球局为什么更快
- 旧球为什么更难打穿
- 罐装球保存方式

### 球拍扩展

- 拍长与杠杆
- 握把形状
- 拍喉稳定性
- 甜区位置
- 扭转稳定性
- lead tape 配重逻辑
- 手柄配重
- 新手第一支拍选择
- 进阶换拍时机
- 不要只看职业球员用拍

### 球线扩展

- 掉磅曲线
- 什么时候剪线
- 线床锁死
- snapback 与旋转
- 圆线 vs 多边线
- 软聚酯 vs 硬聚酯
- 混线主线/横线怎么选
- 冬天为什么要降磅
- 手肘不舒服时怎么调线
- VR/少上场玩家如何安排穿线周期

### 握把与鞋扩展

- 底胶厚度
- 干性/粘性吸汗带
- 换吸汗带周期
- 鞋底磨损读法
- 硬地鞋为什么最通用
- 红土鞋为什么抓地但容易卡硬地
- 室内场地鞋选择
- 东京常见硬地/人工草场地装备适配

### 配件与维护扩展

- 网球包分层
- 护腕和帽子
- 防晒与补水
- 弹力带热身
- 标志碟与脚步训练
- 训练球筐/捡球器
- 何时该花钱升级装备
- 哪些装备参数别迷信

## 图片风格方向

装备百科不是技术球路卡，优先用广义小红书知识图：

- 参数拆解图：球拍/球线/球鞋的局部放大 + 短标签。
- 对比信息图：两三种装备选择并排比较。
- 决策树：新手/进阶/手肘不适/少上场等场景如何选。
- 维护清单：开罐、穿线、换吸汗带、鞋底磨损。

不强行画复杂真实球路。装备卡的准确性重点是参数、定义、适用场景和误区，而不是动作轨迹。
