# Hillstead Farms — photo tools
#   .\photos.ps1 sheet   -> contact sheet of "Website Photos" for review (_contact.png)
#   .\photos.ps1 build   -> resize/export gallery photos into site\img\gallery (from MAP below)
# Honors EXIF orientation. Requires only built-in .NET System.Drawing.

param([string]$Mode = "sheet")

Add-Type -AssemblyName System.Drawing

$SrcDir  = "C:\Users\Andrew Piro\Desktop\Claude\hillstead-farms\Website Photos"
$OutDir  = "C:\Users\Andrew Piro\Desktop\Claude\hillstead-farms\site\img\gallery"
$Sheet   = "C:\Users\Andrew Piro\Desktop\Claude\hillstead-farms\_contact.png"

function Load-Oriented([string]$path) {
  $img = [System.Drawing.Image]::FromFile($path)
  if ($img.PropertyIdList -contains 274) {
    $o = $img.GetPropertyItem(274).Value[0]
    switch ([int]$o) {
      3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
      6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
      8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
    }
  }
  return $img
}

function Save-Jpeg([System.Drawing.Bitmap]$bmp, [string]$path, [int]$quality) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
  $bmp.Save($path, $codec, $ep)
}

function Resize-Max([System.Drawing.Image]$img, [int]$maxEdge) {
  $scale = [Math]::Min(1.0, $maxEdge / [Math]::Max($img.Width, $img.Height))
  $w = [int][Math]::Round($img.Width * $scale)
  $h = [int][Math]::Round($img.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose()
  return $bmp
}

if ($Mode -eq "sheet") {
  $files = Get-ChildItem $SrcDir -File | Sort-Object Name
  [int]$cell = 320; [int]$cols = 4; [int]$labelH = 28
  [int]$rows = [Math]::Ceiling($files.Count / $cols)
  $sheetBmp = New-Object System.Drawing.Bitmap(($cell * $cols), (($cell + $labelH) * $rows))
  $g = [System.Drawing.Graphics]::FromImage($sheetBmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $font = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
  $i = 0
  foreach ($f in $files) {
    $img = Load-Oriented $f.FullName
    $scale = [Math]::Min($cell / $img.Width, $cell / $img.Height)
    [int]$w = $img.Width * $scale; [int]$h = $img.Height * $scale
    [int]$cx = ($i % $cols) * $cell; [int]$cy = [Math]::Floor($i / $cols) * ($cell + $labelH)
    $g.DrawImage($img, $cx + [int](($cell - $w) / 2), $cy + [int](($cell - $h) / 2), $w, $h)
    $g.DrawString(($f.Name + "  " + $img.Width + "x" + $img.Height), $font, [System.Drawing.Brushes]::Black, $cx + 6, $cy + $cell + 4)
    $img.Dispose(); $i++
  }
  $g.Dispose(); $sheetBmp.Save($Sheet); $sheetBmp.Dispose()
  Write-Output "sheet written: $Sheet ($($files.Count) photos)"
}

if ($Mode -eq "build") {
  # source file -> output slug (web names; keep lowercase-hyphen)
  $MAP = @{}
  Get-Content "$PSScriptRoot\gallery-map.txt" | ForEach-Object {
    $line = $_.Trim(); if ($line -eq "" -or $line.StartsWith("#")) { return }
    $parts = $line -split "\s*=>\s*"; if ($parts.Count -eq 2) { $MAP[$parts[0]] = $parts[1] }
  }
  New-Item -ItemType Directory -Force $OutDir | Out-Null
  foreach ($src in $MAP.Keys) {
    $slug = $MAP[$src]
    $img = Load-Oriented (Join-Path $SrcDir $src)
    $full  = Resize-Max $img 1800;  Save-Jpeg $full  (Join-Path $OutDir "$slug.jpg")       82; $full.Dispose()
    $thumb = Resize-Max $img 900;   Save-Jpeg $thumb (Join-Path $OutDir "$slug-thumb.jpg") 80; $thumb.Dispose()
    Write-Output ("{0,-16} -> {1}.jpg ({2}x{3} src)" -f $src, $slug, $img.Width, $img.Height)
    $img.Dispose()
  }
  Write-Output "gallery built in $OutDir"
}
