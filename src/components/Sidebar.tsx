import {
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { DeleteOutlined } from '@mui/icons-material';

interface Props {
  phone: string;
  isConnected: boolean;
  lastSeen: string | null;
  onLogout: () => void;
  onClearChat: () => void;
}

function formatLastSeen(value: string | null) {
  if (!value) return 'Ожидание сообщений...';

  const date = new Date(value);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'Только что';
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function Sidebar({
  phone,
  isConnected,
  lastSeen,
  onLogout,
  onClearChat,
}: Props) {
  return (
    <Paper
      square
      elevation={0}
      sx={{
        width: { xs: 280, sm: 320 },
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.5} >
          <Avatar sx={{ width: 56, height: 56}}>
            {phone.slice(-2)}
          </Avatar>
          <Box>
            <Typography>Чаты</Typography>
            <Stack direction="row" spacing={0.75}  sx={{ mt: .5 }}>
              <Typography variant="body2">{isConnected ? 'Подключено' : 'Отключено'}</Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5, flex: 1, overflow: 'auto' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ letterSpacing: '.5px' }}
        >
          АКТИВНЫЙ ЧАТ
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            mt: 1.5,
            p: 1.5,
            bgcolor: '#eef2ff',
            borderColor: '#dbe2ff',
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <Avatar sx={{ width: 44, height: 44 }}>
              {phone.slice(-2)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography>+{phone}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {lastSeen ? `Последняя активность: ${formatLastSeen(lastSeen)}` : formatLastSeen(null)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Stack spacing={1} sx={{ mt: 3 }}>
          <Button
            variant="text"
            color="inherit"
            startIcon={<DeleteOutlined />}
            onClick={onClearChat}
            sx={{ justifyContent: 'flex-start', px: 1.5 }}
          >
            Очистить чат
          </Button>
          <Button
            variant="text"
            color="secondary"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{ justifyContent: 'flex-start', px: 1.5 }}
          >
            Выйти
          </Button>
        </Stack>
      </Box>
    
    </Paper>
  );
}
