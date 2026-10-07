import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch } from '../helpers';
import { login } from '../slices/session/sessionSlice';
import { validateCredentials } from '../services/messengerApi';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 0) {
      value = '+7' + value.replace(/^7/, '');
    }

    setPhone(value.slice(0, 12));
  };

  const handlePhoneSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!phone.trim() || phone.length !== 12) return;

    setLoading(true);
    setError('');

    try {
      const { baseUrl, accountData } = await validateCredentials(
        idInstance.trim(),
        apiTokenInstance.trim(),
      );

      dispatch(
        login({
          idInstance: idInstance.trim(),
          apiTokenInstance: apiTokenInstance.trim(),
          phone: phone.replace(/\D/g, ''),
          baseUrl,
          accountData,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка подключения. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
       background: 'radial-gradient(circle at 50% 0%, #a6d1ff 0%, #cce0ff 40%, #e6f0ff 100%)'
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography variant="h4">MESSENGER</Typography>
              </Stack>

             
                <Box component="form" onSubmit={handlePhoneSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Ваш ID"
                      value={idInstance}
                      onChange={(e) => setIdInstance(e.target.value)}
                      helperText="Ваш ID из личного кабинета GREEN-API"
                      required
                      fullWidth
                    />
                    <TextField
                      label="Ваш токен"
                      value={apiTokenInstance}
                      onChange={(e) => setApiTokenInstance(e.target.value)}
                      type="password"
                      helperText="Токен авторизации из личного кабинета GREEN-API"
                      required
                      fullWidth
                    />
                    <TextField
                      label="Номер телефона Max собеседника"
                      helperText="Номер телефона"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder='+71234567890'
                      type="tel"
                      required
                      fullWidth
                      slotProps={{
                        htmlInput: {
                          maxLength: 12,
                          inputMode: 'numeric',
                        },
                      }}
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" size="large" disabled={loading} sx={{bgcolor: '#0079fc','&:hover': { bgcolor: '#70acea' }}}>
                      {loading ? 'Подключение...' : 'Создать чат'}
                    </Button>
                    <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                        <Link
                          href="https://green-api.com/max"
                          target="_blank"
                          rel="noreferrer"
                          underline='none'
                          sx={{ fontWeight: 600, color: '#BDBDBD' }}
                        >
                          Регистрация
                        </Link>
                      </Box>
                  </Stack>
                </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
