@echo off

set project_root=%~dp0%

pushd %project_root%\reflect
    deno run --allow-read=.. --allow-write=.. .\main.ts ..\examples\
popd