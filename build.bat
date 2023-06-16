@echo off

set project_root=%~dp0%

pushd %project_root%\gen
    deno run --allow-read=.. --allow-write=.. .\main.ts ..\examples\test.ts
popd