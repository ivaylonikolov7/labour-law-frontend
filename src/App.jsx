import { useState, useRef, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  createTheme,
  ThemeProvider,
  CssBaseline,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";

const getEmail = () => ["ivaylon", "proton.me"].join("@");

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#853953" },
    secondary: { main: "#b06080" },
    background: { default: "#12111A", paper: "#1E1C28" },
    text: { primary: "#E8E6F0", secondary: "#9993AA" },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState("employee");
  const [selectedSource, setSelectedSource] = useState(null);
  const [talking, setTalking] = useState(false);
  const talkingTimer = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE ?? ""}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, persona }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "pencho", text: data.answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "pencho", text: `Грешка: ${err.message}`, sources: [] },
      ]);
    } finally {
      setLoading(false);
      setTalking(true);
      clearTimeout(talkingTimer.current);
      talkingTimer.current = setTimeout(() => setTalking(false), 5000);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 3,
          px: 2,
          background: "radial-gradient(ellipse at 50% 40%, #3d1a2e 0%, #1a0f1f 40%, #12111A 70%)",
          position: "relative",
        }}
      >
        {/* Pulsing glow overlay when loading */}
        {loading && (
          <Box
            sx={{
              position: "fixed",
              inset: 0,
              background: "radial-gradient(ellipse at 50% 40%, #8b1a42 0%, #4a0f2a 40%, transparent 70%)",
              animation: "glowPulse 1.4s ease-in-out infinite",
              "@keyframes glowPulse": {
                "0%, 100%": { opacity: 0.2 },
                "50%": { opacity: 0.6 },
              },
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* Character image */}
        <Box
          component="img"
          src={talking ? "/talking.webp" : "/first-frame.png"}
          alt="Пенчо"
          sx={{
            width: "100%",
            maxWidth: 600,
            height: 220,
            objectFit: "cover",
            objectPosition: "center 55%",
            display: "block",
            position: "relative",
            zIndex: 1,
          }}
        />

        {/* Chat box */}
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 600,
            height: 500,
            display: "flex",
            flexDirection: "column",
            borderRadius: "0 0 12px 12px",
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              px: 2.5,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                👴 Пенчо
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontStyle: "italic" }}>
                старши мениджър
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={persona}
              exclusive
              size="small"
              onChange={(_, val) => { if (val) setPersona(val); }}
              sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2 }}
            >
              <ToggleButton
                value="employee"
                sx={{
                  color: "#fff", border: "none", px: 1.5, py: 0.5,
                  fontSize: "0.75rem", fontWeight: 600,
                  "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.3)", color: "#fff" },
                }}
              >
                👤 Служител
              </ToggleButton>
              <ToggleButton
                value="employer"
                sx={{
                  color: "#fff", border: "none", px: 1.5, py: 0.5,
                  fontSize: "0.75rem", fontWeight: 600,
                  "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.3)", color: "#fff" },
                }}
              >
                🏢 Работодател
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 1.5 }}>
            {messages.length === 0 && !loading && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                Задайте въпрос за трудовото законодателство...
              </Typography>
            )}
            <Stack spacing={1.5}>
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      alignItems: "flex-end",
                      gap: 0.75,
                    }}
                  >
                    {!isUser && (
                      <Typography fontSize="1.4rem" lineHeight={1} mb="2px">👴</Typography>
                    )}
                    <Box sx={{ maxWidth: "72%" }}>
                      {!isUser && (
                        <Typography
                          variant="caption" fontWeight={700} color="secondary.main"
                          display="block" mb={0.3}
                        >
                          Пенчо
                        </Typography>
                      )}
                      <Paper
                        elevation={1}
                        sx={{
                          px: 1.5, py: 1,
                          bgcolor: isUser ? "primary.main" : "#2A2838",
                          color: "text.primary",
                          borderRadius: isUser ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.text}
                      </Paper>
                      {!isUser && msg.sources?.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
                          {msg.sources.map((src, si) => (
                            <Chip
                              key={si}
                              label={src.article}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              clickable
                              onClick={() => setSelectedSource(src)}
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}

              {loading && (
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.75 }}>
                  <Typography fontSize="1.4rem" lineHeight={1} mb="2px">👴</Typography>
                  <Paper
                    elevation={1}
                    sx={{ px: 1.5, py: 1, borderRadius: "14px 14px 14px 3px", bgcolor: "#2A2838" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={12} color="secondary" />
                      <Typography variant="caption" color="text.secondary" fontStyle="italic">
                        Пенчо мисли...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}

              <div ref={bottomRef} />
            </Stack>
          </Box>

          {/* Input bar */}
          <Box
            sx={{
              borderTop: "1px solid", borderColor: "divider",
              px: 1.5, py: 1,
              display: "flex", gap: 1, alignItems: "center",
              flexShrink: 0,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Напишете въпрос..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={loading}
              inputProps={{ style: { fontSize: "0.875rem" } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
            />
            <IconButton
              size="small"
              onClick={send}
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: "primary.main", color: "#fff", borderRadius: 2, p: "7px",
                "&:hover": { bgcolor: "secondary.main" },
                "&.Mui-disabled": { bgcolor: "#b08a9a", color: "#fff" },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>

        {/* Links */}
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Box
            component="a"
            href="https://ivaylo.space"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex", alignItems: "center", gap: 0.3,
              color: "#9993AA", fontSize: "0.75rem", textDecoration: "none",
              "&:hover": { color: "#853953" },
            }}
          >
            <LanguageIcon sx={{ fontSize: "0.85rem" }} /> ivaylo.space
          </Box>
          <Box
            component="a"
            href="https://ko-fi.com/ivaylonikolov"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "#9993AA", fontSize: "0.75rem", textDecoration: "none",
              "&:hover": { color: "#853953" },
            }}
          >
            ☕ Ko-fi
          </Box>
          <Box
            component="span"
            onClick={() => { window.location.href = `mailto:${getEmail()}`; }}
            sx={{
              display: "flex", alignItems: "center", gap: 0.3,
              color: "#9993AA", fontSize: "0.75rem", cursor: "pointer",
              "&:hover": { color: "#853953" },
            }}
          >
            <EmailIcon sx={{ fontSize: "0.85rem" }} /> Contact
          </Box>
        </Box>
      </Box>

      <Dialog open={!!selectedSource} onClose={() => setSelectedSource(null)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{ bgcolor: "primary.main", color: "#fff", py: 1.5, fontSize: "0.95rem", fontWeight: 700 }}
        >
          {selectedSource?.article}
          <Typography variant="caption" display="block" sx={{ opacity: 0.8, fontWeight: 400 }}>
            {selectedSource?.source}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
            {selectedSource?.text}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="small" color="secondary" onClick={() => setSelectedSource(null)}>
            Затвори
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
