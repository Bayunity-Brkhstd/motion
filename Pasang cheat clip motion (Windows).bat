@echo off
rem Klik dua kali file ini di Windows untuk memasang cheat clip motion.
title BAYUNITY.EXE - Cheat Clip & Motion Installer
color 0A
mode con: cols=95 lines=30
cls

echo.
echo   ____     _      __   __ _   _  _   _  ___  _____  __   __        _____  __  __ _____ 
echo  ^| __ )   / \     \ \ / /^| ^| ^| ^|^| \ ^| ^|^|_ _^|^|_   _^| \ \ / /       ^| ____^| \ \/ /^| ____^|
echo  ^|  _ \  / _ \     \ V / ^| ^| ^| ^|^|  \^| ^| ^| ^|   ^| ^|    \ V /   _    ^|  _^|    \  / ^|  _^|  
echo  ^| ^|_) ^|/ ___ \     ^| ^|  ^| ^|_^| ^|^| ^|\  ^| ^| ^|   ^| ^|     ^| ^|   (_)   ^| ^|___   /  \ ^| ^|___ 
echo  ^|____//_/   \_\    ^|_^|   \___/ ^|_^| \_^|^|___^|  ^|_^|     ^|_^|         ^|_____^| /_/\_\^|_____^|
echo.
echo =======================================================================================
echo    [CORE ENGINE] Cheat Clip & Motion Studio   ^|   Mode: NATIVE REMOTION
echo =======================================================================================
echo.

for /L %%i in (1,1,15) do (
    echo   01001010 11010010 [LOAD_MODULE_%%i] %RANDOM%%RANDOM% 00110101 10101100 [OK]
    ping -n 1 -w 25 127.0.0.1 >nul
)

echo.
echo  [ACCESS GRANTED] Menjalankan pemasang Windows...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0studio\pasang-windows.ps1"
echo.
pause
