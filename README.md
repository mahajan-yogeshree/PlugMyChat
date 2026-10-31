# Reverse engineer anything

This environment runs [REA](https://github.com/morluto/rea) (`rea-agents` 6.8.0) with the open analysis tools its workflows call. REA is the agent-facing CLI and MCP server. The other programs are the engines it drives: decompilers, disassemblers, debuggers, and format parsers.

Analysis stays on this machine. REA is for software you own or are allowed to examine.

## Use it

Source the tool paths, then ask REA about a local file:

```sh
. /etc/profile.d/rea.sh
rea doctor --client cursor --skill
rea decompile /absolute/path/to/binary --procedure main --provider ghidra --json
```

The same script is in `scripts/rea-env.sh`. It exports `ENABLE_TOOL_SEARCH=true`, so agent sessions that load this environment defer MCP tool definitions and search for them instead of sending the full catalog on every call. The same value is in `.claude/settings.json` and in the REA MCP `env`. Cursor is already registered. Its MCP entry is `~/.cursor/mcp.json`, mirrored by `.cursor/mcp.json`. The server advertises the full catalog: **229 tools** and **6 prompts**. No tool family is filtered out. Restart Cursor after this registration so the live session reloads MCP.

The investigation workflow is installed at `~/.agents/skills/reverse-engineer-anything` and copied in this repo under `.agents/skills/reverse-engineer-anything`.

## What is installed

| Tool | Role | Version |
| --- | --- | --- |
| REA | CLI and MCP server | 6.8.0 (Node.js 22.23.4) |
| Ghidra | Native decompiler | 12.1.4 with JDK 21.0.12 |
| Hopper | Native decompiler | Official demo at `/opt/hopper/bin/Hopper` |
| Kuna | Native decompiler | 1.833, the release REA 6.8.0 verifies |
| JADX | Android decompiler CLI | 1.5.6 |
| jadx-headless-mcp | Android MCP bridge | 0.7.1, SHA-256 checked |
| Rizin | Disassembler and debugger | 0.9.1 |
| GNU objdump and GDB | Disassembly and debugging | binutils, GDB 15.1 |
| radare2 | Extra disassembler | 5.5.0 from Ubuntu |
| WABT | WebAssembly | 1.0.42 |
| Binwalk | Firmware signatures | 3.1.0 (`REA_BINWALK_COMMAND`) |
| Unblob | Firmware extraction | 26.6.4 |
| Apktool | Android resources | 2.7.0 |
| adb, tshark, capinfos | Device and packet inspection | Ubuntu packages |
| mitmdump | Capture proxy | 8.1.1 |
| sigrok-cli | Logic traces | 0.7.2 |
| pwntools | ELF layout and crash notes | Ubuntu `python3-pwntools` |
| Frida | Runtime instrumentation | 17.23.2, bundled with REA |

`rea doctor --client cursor --skill` reports the Cursor registration, the skill, Hopper, Ghidra, JADX, and Kuna as ready.

Checked from this machine:

- `inspect_with_objdump` read the ELF headers of `/bin/ls`.
- Rizin identified that file as ELF64 x86-64.
- WABT 1.0.42 validated a small WebAssembly module.
- Ghidra 12.1.4 decompiled a tiny `add` function.
- The MCP server listed all 229 tools, including `open_binary`, `inspect_with_objdump`, `execute_rizin_command`, `inspect_wasm_artifact`, `start_gdb_session`, and `inspect_firmware_regions`.

## Not installed

IDA Pro and JEB are commercial products. REA will use them when you set `REA_IDA_MCP_CONFIG` or `REA_JEB_MCP_URL` to a license you already have. This setup does not download license keys or unofficial builds.

Ubuntu’s `binwalk` 2.3 package is still on `PATH` for manual use. REA is pointed at Binwalk 3.1.0 through `REA_BINWALK_COMMAND` because its firmware parser accepts the 3.1 line.
