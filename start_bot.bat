@echo off
title AmandaBOT Restart
cd /d "%~dp0"
:loop
echo Iniciando o bot...
yarn start
echo O bot parou! Reiniciando em 5 segundos...
timeout /t 5
goto loop
