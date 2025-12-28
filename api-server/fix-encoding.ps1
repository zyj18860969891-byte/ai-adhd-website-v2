# 修复 stdio-mcp-client.js 中的UTF-8编码问题
$filePath = "e:\MultiModel\ai-adhd-website\api-server\src\stdio-mcp-client.js"
$content = Get-Content $filePath -Raw

# 修复常见的中文字符乱码
$content = $content -replace '馃搲 闄嶇骇鍒?', '🔴 降级到'
$content = $content -replace '鏈€灏忓姛鑳芥ā寮?', '最小功能模式'
$content = $content -replace '鈿狅笍 宸茶揪鍒版渶浣庨檷绾х骇鍒?', '💔 已达到最低降级级别'
$content = $content -replace '绂荤嚎妯″紡', '离线模式'
$content = $content -replace '馃搱 鍗囩骇鍒?', '🟡 升级到'
$content = $content -replace '馃攧 浣跨敤绠€鍖栧姛鑳芥ā寮?', '🟢 使用简化功能模式'
$content = $content -replace '鏈€灏忓姛鑳芥ā寮?', '最小功能模式'
$content = $content -replace '鎵€鏈夊姛鑳芥甯歌繍琛?', '所有功能正常运行'
$content = $content -replace '閮ㄥ垎鍔熻兘宸蹭紭鍖栵紝鎬ц兘鎻愬崌涓?', '部分功能已优化，性能提升中'
$content = $content -replace '鏍稿績鍔熻兘姝ｅ父杩愯锛岄儴鍒嗗姛鑳芥殏鏃朵笉鍙敤', '核心功能正常运行，部分功能暂时不可用'
$content = $content -replace '绂荤嚎妯″紡锛屼娇鐢ㄧ紦瀛樻暟鎹?', '离线模式，使用缓存数据'
$content = $content -replace '鏈嶅姟鏆傛椂涓嶅彲鐢紝璇风◢鍚庨噸璇?', '服务暂时不可用，请稍后重试'
$content = $content -replace '鏃犳硶杩炴帴鍒版湇鍔?', '无法连接到服务'
$content = $content -replace '妫€鏌ョ綉缁滆繛鎺?', '检查网络连接'
$content = $content -replace '纭鏈嶅姟姝ｅ湪杩愯', '确认服务正在运行'
$content = $content -replace '妫€鏌ョ綉缁滃欢杩?', '检查网络延迟'
$content = $content -replace '鍑忓皯璇锋眰澶嶆潅搴?', '减少请求复杂度'
$content = $content -replace '绋嶅悗閲嶈瘯', '稍后重试'
$content = $content -replace '妫€鏌ュ嚟鎹槸鍚︽纭?', '检查凭证是否正确'
$content = $content -replace '閲嶆柊鐧诲綍', '重新登录'
$content = $content -replace '鑱旂郴绠＄悊鍛?', '联系管理员'
$content = $content -replace '绛夊緟鍚庨噸璇?', '等待后重试'
$content = $content -replace '鏈嶅姟鏆傛椂涓嶅彲鐢?', '服务暂时不可用'
$content = $content -replace '妫€鏌ユ湇鍔＄姸鎬?', '检查服务状态'
$content = $content -replace '鑱旂郴鎶€鏈敮鎸?', '联系技术支持'
$content = $content -replace '绂荤嚎妯″紡鏃犳硶澶勭悊璇锋眰', '离线模式无法处理请求'

# 写入修复后的内容
$content | Set-Content $filePath -Encoding UTF8
Write-Host "UTF-8 encoding issues fixed"