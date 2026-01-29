@echo off
chcp 65001 >nul
echo ========================================================
echo        Pomodoro Sync - 自动化 GitHub 部署脚本
echo ========================================================
echo.

:: 1. 检查 Git 是否安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git！
    echo 请先安装 Git: https://git-scm.com/
    pause
    exit /b
)

:: 2. 初始化仓库（如果不存在）
if not exist .git (
    echo [信息] 正在初始化 Git 仓库...
    git init
    git branch -M main
)

:: 3. 检查 .gitignore 是否存在
if not exist .gitignore (
    echo [警告] 未找到 .gitignore 文件！
    echo 建议先创建 .gitignore 以保护 .env.local 等敏感文件。
    echo 脚本将暂停，按任意键继续（如果确定要继续）...
    pause
)

:: 4. 添加文件
echo [信息] 正在添加文件 (已自动忽略敏感文件)...
git add .

:: 5. 提交更改
set /p commit_msg="请输入提交说明 (默认: 'Auto update'): "
if "%commit_msg%"=="" set commit_msg=Auto update
git commit -m "%commit_msg%"

:: 6. 配置远程仓库
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [设置] 尚未配置远程 GitHub 仓库。
    echo 请输入您的 GitHub 仓库地址 (例如: https://github.com/username/repo.git)
    set /p remote_url="GitHub 仓库 URL: "
    git remote add origin %remote_url%
)

:: 7. 推送代码
echo [信息] 正在推送到 GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [错误] 推送失败。
    echo 可能原因：
    echo 1. 仓库地址错误
    echo 2. 没有权限 (请确保已登录 GitHub)
    echo 3. 本地与远程冲突 (尝试 git pull)
) else (
    echo.
    echo [成功] 代码已成功推送到 GitHub！
)

echo.
pause
