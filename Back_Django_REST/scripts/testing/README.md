# Scripts de Testing

Scripts para pruebas de funcionalidades específicas del backend.

## Scripts Disponibles

### `test_chat_send.py`
Prueba el envío de mensajes del sistema de chat.

### `test_metrics_endpoints.py`
Verifica el funcionamiento de los endpoints de métricas.

### `test_chat_curl.ps1`
Script PowerShell para probar el chat usando curl.

## Uso

```bash
# Prueba de chat
python scripts/testing/test_chat_send.py

# Prueba de métricas
python scripts/testing/test_metrics_endpoints.py

# Prueba con curl (Windows)
.\scripts\testing\test_chat_curl.ps1
```

## Scripts Históricos

Para scripts de testing antiguos o deprecados, consulta la carpeta `_scripts_historicos/`.
