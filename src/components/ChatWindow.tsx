import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Stack,
  TextareaAutosize,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CircleIcon from '@mui/icons-material/Circle';
import type { Message } from '../types';

interface Props {
  phone: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isConnected: boolean;
}

function toDate(timestamp: number) {
  return new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
}

function formatTime(timestamp: number) {
  return toDate(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(timestamp: number) {
  const date = toDate(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Сегодня';
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера';

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

function statusIcon(status?: Message['status']) {
  switch (status) {
    case 'sent': return '✓';
    case 'delivered':
    case 'read': return '✓✓';
    case 'error': return '✗';
    default: return '';
  }
}

export default function ChatWindow({ phone, messages, onSendMessage, isConnected }: Props) {
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

const structuredMessages = useMemo(() => {
  return messages.map((message, index) => {
    const date = formatDate(message.timestamp);
    const previousDate =
      index > 0 ? formatDate(messages[index - 1].timestamp) : null;

    return {
      message,
      date,
      showDate: date !== previousDate,
    };
  });
}, [messages]);

  const send = () => {
    const value = inputText.trim();
    if (!value) return;
    onSendMessage(value);
    setInputText('');
  };

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #a6d1ff 0%, #cce0ff 40%, #e6f0ff 100%)'
      }}
    >
      <Box sx={{ p: 2, px: { xs: 2, sm: 3 }, bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5}>
          <Avatar>
            {phone.slice(-2)}
          </Avatar>
          <Box>
            <Typography>+{phone}</Typography>
            <Typography variant="body2" color={isConnected ? 'success.main' : 'text.secondary'}>
              <CircleIcon sx={{ fontSize: 9, color: isConnected ? '#1abe43' : 'rgba(255,255,255,.5)' }} />
              {isConnected ? 'В сети' : 'Не в сети'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
        {messages.length === 0 ? (
          <Stack sx={{ height: '100%' }} color="text.secondary">
            <Typography variant="h6">Сообщений пока нет</Typography>
            <Typography variant="body2">Отправьте первое сообщение</Typography>
          </Stack>
        ) : (
          <Stack spacing={.5}>
            {structuredMessages.map(({ message, date, showDate }) => (
              <Box key={message.id}>
                {showDate && (
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        px: 2,
                        py: .75,
                        bgcolor: 'rgba(255,255,255,.9)',
                        borderRadius: 10,
                        boxShadow: 1,
                      }}
                    >
                      {date}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: message.type === 'outgoing' ? 'flex-end' : 'flex-start', mb: 1 }}>
                  <Paper
                    elevation={1}
                    sx={{
                      px: 1.5,
                      py: 1,
                      maxWidth: { xs: '85%', md: '70%' },
                      bgcolor:
                        message.status === 'error'
                          ? '#ffebee'
                          : message.type === 'outgoing'
                            ? '#dcf8c6'
                            : 'white',
                      borderRadius: 2,
                      borderBottomRightRadius: message.type === 'outgoing' ? .5 : 2,
                      borderBottomLeftRadius: message.type === 'incoming' ? .5 : 2,
                      border: message.status === 'error' ? '1px solid #ef5350' : undefined,
                    }}
                  >
                    <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {message.text}
                    </Typography>
                    <Stack direction="row" spacing={.5} sx={{ mt: .5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                      {message.type === 'outgoing' && (
                        <Typography
                          variant="caption"
                          color={message.status === 'error' ? 'error.main' : message.status === 'sent' ? 'success.main' : 'info.main'}
                        >
                          {statusIcon(message.status)}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              </Box>
            ))}
            <div ref={bottomRef} />
          </Stack>
        )}
      </Box>

      <Box sx={{ p: 2, px: { xs: 2, sm: 3 }, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            bgcolor: '#f5f5f5',
            borderRadius: 6,
            p: .75,
            pl: 2,
            '&:focus-within': {
              bgcolor: 'white',
              boxShadow: '0 0 0 2px #667eea',
            },
          }}
        >
          <TextareaAutosize
            minRows={1}
            maxRows={5}
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Введите сообщение..."
            style={{
              flex: 1,
              border: 0,
              outline: 0,
              resize: 'none',
              background: 'transparent',
              font: 'inherit',
              lineHeight: 1.5,
              padding: '8px 0',
            }}
          />
          <IconButton
            color="primary"
            onClick={send}
            disabled={!inputText.trim()}
            sx={{
              width: 44,
              height: 44,
              color: inputText.trim() ? 'white' : 'text.secondary',
              bgcolor: inputText.trim() ? 'primary.main' : 'grey.300',
              '&:hover': { bgcolor: inputText.trim() ? 'primary.dark' : 'grey.300' },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
