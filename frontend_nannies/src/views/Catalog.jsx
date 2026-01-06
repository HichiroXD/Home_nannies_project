import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNannies } from "@api/nannyApi";
import { addFavorite, deleteFavorite, getFavorites } from "@api/favoriteApi";
import chatApi from "@api/chatApi";
import { useApiData } from "@/hooks";
import { NannyFilters, NannyCard } from "@components/nanny";
import { MainLayout } from "@components/layout";
import { AlertToast, useAlert } from "@components/common";
import { Loader } from "@components/layout";
import useAuthStore from "@/stores/useAuthStore";
import logger from "@/utils/logger";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

export default function Catalog() {
  const [error, setError] = useState("");
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { showAlert, alert, setAlert } = useAlert();
  const [filters, setFilters] = useState({
    search: "",
    max_rate: "",
    min_experience: "",
    verified: false,
  });
  const navigate = useNavigate();
  const { role: userRole, accessToken, isAuthenticated } = useAuthStore();

  // Cargar niñeras con useApiData
  const { 
    data: nannies, 
    loading,
    refetch: refetchNannies 
  } = useApiData(
    async () => {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.max_rate) params.max_rate = filters.max_rate;
      if (filters.min_experience) params.min_experience = filters.min_experience;
      if (filters.verified) params.verified = true;
      return await getNannies(params);
    },
    [filters.search, filters.max_rate, filters.min_experience, filters.verified],
    {
      onError: () => {
        showAlert("No se pudieron cargar las niñeras.", "error");
      },
    }
  );

  // Asegurar que nannies siempre sea un array
  const safeNannies = nannies || [];

  // Cargar favoritos con useApiData
  const { 
    data: favorites, 
    setData: setFavorites,
    refetch: fetchFavorites 
  } = useApiData(
    async () => {
      if (!accessToken) return [];
      const favs = await getFavorites();
      if (!Array.isArray(favs)) {
        logger.warn('getFavorites returned unexpected payload', { favs });
        return [];
      }
      return favs;
    },
    [accessToken],
    {
      immediate: !!accessToken,
      onError: (err) => {
        logger.error('Error cargando favoritos', { error: err });
        setFavorites([]);
      },
    }
  );

  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    refetchNannies();
  }, [refetchNannies]);

  const handleFavorite = useCallback(async (nannyId) => {
    if (!isAuthenticated) {
      showAlert("Debes iniciar sesión para usar favoritos.", "warning");
      navigate("/login");
      return;
    }

    setFavoriteLoading(true);
    try {
      const favList = favorites || [];
      // buscar favorito existente por nanny.id
      const existing = favList.find((f) => f.nanny?.id === nannyId);
      if (existing) {
        // eliminar usando el id del Favorite
        await deleteFavorite(existing.id);
        setFavorites(favList.filter((f) => f.nanny?.id !== nannyId));
        showAlert("Niñera eliminada de favoritos.", "info");
      } else {
        // crear favorito; backend devuelve el objeto Favorite
        const created = await addFavorite(nannyId);
        if (created) setFavorites([...favList, created]);
        showAlert("¡Niñera añadida a favoritos! ❤️", "success");
      }
    } catch (err) {
      logger.error('Error con favoritos', { nannyId, error: err.message, data: err.response?.data });
      const msg = err.response?.data?.detail || err.response?.data || err.message || "No se pudo procesar la acción.";
      showAlert(msg, "error");
    } finally {
      setFavoriteLoading(false);
    }
  }, [favorites, navigate, showAlert, isAuthenticated, setFavorites]);

  const handleBookingClick = useCallback((nannyId) => {
    if (!isAuthenticated) {
      // Redirect usando state de react-router en lugar de localStorage
      navigate("/login", { state: { redirectTo: `/catalog?nanny=${nannyId}` } });
      return;
    }

    // Verificar que el usuario no sea una niñera
    if (userRole === "nanny") {
      showAlert("Las niñeras no pueden contactar a otras niñeras", "error");
      return;
    }

    navigate(`/bookings/create/${nannyId}`);
  }, [navigate, userRole, showAlert, isAuthenticated]);

  const handleMessageClick = useCallback(async (nannyUserId) => {
    if (!isAuthenticated) {
      showAlert("Debes iniciar sesión para enviar mensajes.", "warning");
      navigate("/login");
      return;
    }

    // Verificar que el usuario no sea una niñera
    if (userRole === "nanny") {
      showAlert("Las niñeras no pueden contactar a otras niñeras", "error");
      return;
    }

    try {
      // Crear o obtener la conversación
      const result = await chatApi.getOrCreateConversation(nannyUserId);
      logger.info('Conversation created/retrieved', result);
      
      // Navegar al chat con la conversación seleccionada
      navigate('/chat', { state: { conversationId: result.conversation_id } });
    } catch (err) {
      logger.error('Error al crear conversación', { error: err });
      showAlert("No se pudo iniciar la conversación. Intenta nuevamente.", "error");
    }
  }, [navigate, userRole, showAlert, isAuthenticated]);

  // Memoizar nannies favoriteadas para evitar recalculos
  const nannyFavoriteStatusMap = useMemo(() => {
    const map = new Map();
    const favList = favorites || [];
    favList.forEach(fav => {
      if (fav.nanny?.id) {
        map.set(fav.nanny.id, true);
      }
    });
    return map;
  }, [favorites]);

  return (
    <MainLayout>
      <AlertToast {...alert} onClose={() => setAlert({})} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Card 
            elevation={2} 
            sx={{ 
              background: 'linear-gradient(135deg, #fbb6ce 0%, #fce7f3 100%)',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 2 }}>
                Catálogo de Niñeras
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.700', mb: 2 }}>
                Encuentra a la niñera perfecta para tu infante
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 2,
                  p: 2,
                  border: '1px solid #f9a8d4',
                }}
              >
                <Typography variant="body2" sx={{ color: 'grey.700', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <span style={{ fontSize: '1.125rem' }}>💡</span>
                  <span>
                    <strong>Precios mostrados:</strong> Los valores indicados son tarifas por hora en pesos chilenos (CLP).
                    El costo total de tu reserva se calculará automáticamente según el número de horas que contrates.
                  </span>
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          <NannyFilters
            filters={filters}
            onChange={handleFilterChange}
            onSubmit={handleSearch}
          />

          {loading ? (
            <Loader />
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : (
            <Card 
              elevation={1}
              sx={{ 
                background: 'linear-gradient(135deg, #fecdd3 0%, #fce7f3 100%)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 3,
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {safeNannies.length > 0 ? (
                    safeNannies.map((nanny) => (
                      <Grid item xs={12} sm={6} lg={4} key={nanny.id}>
                        <NannyCard
                          nanny={nanny}
                          onFavorite={handleFavorite}
                          onBook={handleBookingClick}
                          onMessage={handleMessageClick}
                          isFavorited={nannyFavoriteStatusMap.has(nanny.id)}
                          isLoading={favoriteLoading}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1" sx={{ textAlign: 'center', color: 'grey.500', py: 5 }}>
                        No se encontraron niñeras con los filtros seleccionados.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Botón cargar más */}
          {!loading && safeNannies.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  // Aquí se puede implementar paginación en el futuro
                  showAlert("Mostrando todas las niñeras disponibles", "info");
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                Cargar más personas
              </Button>
            </Box>
          )}
        </Stack>
      </Container>
    </MainLayout>
  );
}
