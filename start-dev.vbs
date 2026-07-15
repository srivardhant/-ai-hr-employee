Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "C:\Users\sriva\.gemini\antigravity\scratch\ai-hr-employee"
shell.Run "%comspec% /c npm run dev", 0, False
