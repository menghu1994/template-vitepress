const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function deploy() {
  let originalBranch = '';

  try {
    console.log('🚀 开始构建...');
    execSync('npm run docs:build', { stdio: 'inherit' });

    console.log('📦 构建完成，开始部署...');

    // 修正路径：从 deploy/ 目录回到上级，然后访问 public/
    const distPath = path.join(__dirname, '..', 'public');
    const worktreeDir = path.join(__dirname, '..', '.pages-worktree');

    console.log(`📁 构建目录: ${distPath}`);
    console.log(`📁 Worktree 目录: ${worktreeDir}`);

    // 获取当前分支
    originalBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📝 当前分支: ${originalBranch}`);

    try {
      execSync('git show-ref --verify --quiet refs/heads/pages', { stdio: 'ignore' });
      console.log('✅ pages 分支已存在');
    } catch (e) {
      console.log('📝 创建 pages 分支...');
      // 创建空的 pages 分支
      execSync('git checkout --orphan pages', { stdio: 'inherit' });
      // 清空工作区
      execSync('git rm -rf .', { stdio: 'inherit' });
      // 初始提交
      execSync('git commit --allow-empty -m "Initial pages branch"', { stdio: 'inherit' });
      execSync('git push origin pages', { stdio: 'inherit' });
      // 切换回原分支
      execSync(`git checkout ${originalBranch}`, { stdio: 'inherit' });
    }

    // 删除已有的 worktree
    try {
      execSync(`git worktree remove ${worktreeDir} --force`, { stdio: 'ignore' });
      console.log('✅ 已删除现有 worktree');
    } catch (e) {
      // worktree 不存在，忽略错误
      console.log('ℹ️ 没有找到现有的 worktree');
    }

    // 创建 worktree
    console.log('📁 创建 worktree...');
    execSync(`git worktree add -f ${worktreeDir} pages`, { stdio: 'inherit' });

    // 检查构建目录是否存在
    if (!fs.existsSync(distPath)) {
      throw new Error(`构建目录不存在: ${distPath}，请先运行 npm run docs:build`);
    }

    // 清空 pages 分支内容（保留 .git 目录）
    console.log('🧹 清空 pages 分支内容...');
    const pagesFiles = fs.readdirSync(worktreeDir);
    pagesFiles.forEach(file => {
      if (file !== '.git' && file !== '.github') {
        const filePath = path.join(worktreeDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
    });

    // 复制构建文件到 pages 分支
    console.log('📄 复制构建文件...');
    const distFiles = fs.readdirSync(distPath);
    distFiles.forEach(file => {
      const srcPath = path.join(distPath, file);
      const destPath = path.join(worktreeDir, file);

      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });

    // 提交更改
    console.log('💾 提交更改...');
    execSync('git add .', { cwd: worktreeDir, stdio: 'inherit' });

    // 检查是否有更改需要提交
    try {
      execSync('git diff-index --quiet HEAD', { cwd: worktreeDir });
      console.log('ℹ️ 没有更改需要提交');
    } catch (e) {
      // 有更改，执行提交
      const commitMessage = `deploy: update pages - ${new Date().toISOString()}`;
      execSync(`git commit -m "${commitMessage}"`, { cwd: worktreeDir, stdio: 'inherit' });
      execSync('git push origin pages', { cwd: worktreeDir, stdio: 'inherit' });
      console.log('✅ 更改已提交并推送');
    }

    // 清理 worktree
    console.log('🧹 清理 worktree...');
    execSync(`git worktree remove ${worktreeDir} --force`, { stdio: 'inherit' });

    console.log('🎉 部署完成！');

  } catch (error) {
    console.error('❌ 部署失败:', error);

    // 如果 originalBranch 存在，尝试切换回原分支
    if (originalBranch) {
      try {
        console.log(`🔄 尝试切换回原分支: ${originalBranch}`);
        execSync(`git checkout ${originalBranch}`, { stdio: 'inherit' });
      } catch (switchError) {
        console.error('❌ 切换回原分支失败:', switchError);
      }
    }

    // 尝试清理 worktree
    try {
      const worktreeDir = path.join(__dirname, '..', '.pages-worktree');
      execSync(`git worktree remove ${worktreeDir} --force`, { stdio: 'ignore' });
    } catch (e) {
      // 忽略清理错误
    }
  }
}

deploy();
