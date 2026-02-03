$lines = Get-Content "src/renderer/index.html"
$markerIndex = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Select a file to view content") {
        $markerIndex = $i
        break
    }
}

if ($markerIndex -ne -1) {
    Write-Host "Marker found at $markerIndex"
    # We want to insert after the wrapper div, which should be 2 lines after the marker line
    # Line map:
    # i: marker
    # i+1: </div> (empty state)
    # i+2: </div> (wrapper)
    # i+3: [INSERT HERE]
    
    $insertIndex = $markerIndex + 3
    
    $newLines = @()
    $newLines += $lines[0..($insertIndex - 1)]
    $newLines += '                <!-- Status Bar -->'
    $newLines += '                <div class="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] select-none z-20 font-sans">'
    $newLines += '                     <div class="flex items-center gap-3">'
    $newLines += '                         <div class="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer transition-colors"><i class="codicon codicon-source-control"></i> main*</div>'
    $newLines += '                         <div class="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer transition-colors"><i class="codicon codicon-error text-red-200"></i> 0 <i class="codicon codicon-warning text-yellow-200"></i> 0</div>'
    $newLines += '                     </div>'
    $newLines += '                     <div class="flex items-center gap-4">'
    $newLines += '                         <div class="hover:bg-white/20 px-1 rounded cursor-pointer transition-colors">Ln 1, Col 1</div>'
    $newLines += '                         <div class="hover:bg-white/20 px-1 rounded cursor-pointer transition-colors">UTF-8</div>'
    $newLines += '                         <div class="hover:bg-white/20 px-1 rounded cursor-pointer transition-colors">JavaScript</div>'
    $newLines += '                         <div class="hover:bg-white/20 px-1 rounded cursor-pointer transition-colors"><i class="codicon codicon-bell"></i></div>'
    $newLines += '                     </div>'
    $newLines += '                </div>'
    $newLines += $lines[$insertIndex..($lines.Count - 1)]
    
    $newLines | Set-Content "src/renderer/index.html" -Encoding UTF8
    Write-Host "Patched Status Bar successfully"
}
else {
    Write-Host "Marker not found"
    Exit 1
}
