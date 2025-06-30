#!/bin/bash

echo "Probando endpoints del dashboard..."

echo "1. Estadísticas globales:"
curl -s -X GET "http://localhost:8081/api/dashboard/stats" -H "Content-Type: application/json" | python3 -m json.tool

echo -e "\n2. Actividad mensual:"
curl -s -X GET "http://localhost:8081/api/dashboard/activity/monthly?months=7" -H "Content-Type: application/json" | python3 -m json.tool

echo -e "\n3. Estadísticas por categorías:"
curl -s -X GET "http://localhost:8081/api/dashboard/categories" -H "Content-Type: application/json" | python3 -m json.tool

echo -e "\n4. Actividad reciente:"
curl -s -X GET "http://localhost:8081/api/dashboard/activity/recent?limit=5" -H "Content-Type: application/json" | python3 -m json.tool

echo -e "\n5. Impacto de residuos:"
curl -s -X GET "http://localhost:8081/api/dashboard/waste-impact" -H "Content-Type: application/json" | python3 -m json.tool

echo -e "\n6. Tendencias de crecimiento:"
curl -s -X GET "http://localhost:8081/api/dashboard/trends" -H "Content-Type: application/json" | python3 -m json.tool
