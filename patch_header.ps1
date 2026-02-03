$lines = Get-Content "src/renderer/index.html"
$startIndex = -1
$endIndex = -1
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Tab / Breadcrumb Header") { $startIndex = $i }
    if ($lines[$i] -match "Code Content") { $endIndex = $i }
}

if ($startIndex -ne -1 -and $endIndex -ne -1) {
    Write-Host "Found markers at $startIndex and $endIndex"
    $newLines = @()
    $newLines += $lines[0..($startIndex-1)]
    
    # Insert new content
    $newLines += '                <!-- Tab Header (VS Code Style) -->'
    $newLines += '                <div class="h-9 flex bg-[#f3f3f3] border-b border-[#e5e5e5] select-none">'
    $newLines += '                    <div class="flex items-center gap-2 px-3 bg-white border-r border-[#e5e5e5] min-w-[140px] max-w-[200px] h-full border-t-2 border-t-[#007acc] relative group cursor-pointer">'
    $newLines += '                        <i class="codicon codicon-file-code text-[#E6A32E] text-xs"></i>'
    $newLines += '                        <span id="current-file-name" class="text-[13px] text-[#333] truncate">No File</span>'
    $newLines += '                        <i class="codicon codicon-close ml-auto text-[#666] opacity-0 group-hover:opacity-100 hover:bg-[#e8eaed] rounded p-0.5 cursor-pointer text-[10px]"></i>'
    $newLines += '                    </div>'
    $newLines += '                    <div class="flex-1 flex items-center justify-end px-2">'
    $newLines += '                        <button id="btn-wireframe" class="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-[#555] hover:bg-[#e8e8e8] rounded transition-colors">'
    $newLines += '                            <i class="codicon codicon-layout-sidebar-right"></i>'
    $newLines += '                            <span class="hidden md:inline">Wireframe</span>'
    $newLines += '                        </button>'
    $newLines += '                    </div>'
    $newLines += '                </div>'
    $newLines += '                <!-- Breadcrumbs -->'
    $newLines += '                <div class="h-6 flex items-center px-4 bg-white border-b border-zinc-100 text-[11px] text-[#666] gap-1.5 shadow-sm z-10 select-none">'
    $newLines += '                     <span>workspace</span>'
    $newLines += '                     <i class="codicon codicon-chevron-right text-[10px] opacity-70"></i>'
    $newLines += '                     <span class="text-[#333] font-medium" id="breadcrumb-file">...</span>'
    $newLines += '                </div>'
    
    # Append the rest (including "Code Content" line)
    $newLines += $lines[$endIndex..($lines.Count-1)]
    
    $newLines | Set-Content "src/renderer/index.html" -Encoding UTF8
    Write-Host "Patch complete."
} else {
    Write-Host "Markers not found."
    Exit 1
}
