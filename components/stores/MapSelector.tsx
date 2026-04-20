"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Substituído geo-tz por countries-and-timezones
import { getTimezonesForCountry } from "countries-and-timezones";

// Import do plugin de Geocoding
import "./MapSelector.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import * as Geocoder from "leaflet-control-geocoder";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationData {
  lat: number;
  lng: number;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  timezone: string;
}

interface MapSelectorProps {
  onLocationSelect: (data: LocationData) => void;
  initialPosition?: [number, number];
}

export default function MapSelector({ 
  onLocationSelect, 
  initialPosition = [41.1579, -8.6291] 
}: MapSelectorProps) {
  const [position, setPosition] = useState<[number, number]>(initialPosition);

  // Timezones manuais para países conhecidos (mais correto que a lib)
  const manualTimezones: Record<string, string> = {
    PT: "Europe/Lisbon",
    ES: "Europe/Madrid",
    GB: "Europe/London",
    FR: "Europe/Paris",
    DE: "Europe/Berlin",
    IT: "Europe/Rome",
    BR: "America/Sao_Paulo",
    US: "America/New_York",
  };

  // Função para extrair a timezone baseada no código do país
  const getTimezoneFromCountryCode = (countryCode?: string) => {
    if (!countryCode) return "UTC";
    // Primeiro verificar mapping manual
    if (manualTimezones[countryCode.toUpperCase()]) {
      return manualTimezones[countryCode.toUpperCase()];
    }
    // Fallback para a lib
    const zones = getTimezonesForCountry(countryCode.toUpperCase());
    return zones && zones.length > 0 ? zones[0].name : "UTC";
  };

  // Campos alternativos para district/state
  const getState = (addr: any) => {
    return (
      addr.state ||
      addr.county ||
      addr.region ||
      addr.administrative ||
      ""
    );
  };

  // Reverse Geocoding ao clicar manualmente
  const getAddressDetails = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      const addr = data.address || {};

      const tz = getTimezoneFromCountryCode(addr.country_code);

      // Construir morada completa
      let street = "";
      
      if (addr.house_number && addr.road) {
        street = `${addr.road}, ${addr.house_number}`;
      } else if (addr.road) {
        street = addr.road;
      } else if (addr.hamlet || addr.suburb) {
        street = addr.hamlet || addr.suburb;
      } else if (data.display_name) {
        street = data.display_name.split(",")[0].trim();
      }

      // Limpar morada se muito longa
      if (street.includes(",") && street.length > 60) {
        street = street.split(",")[0].trim();
      }

      onLocationSelect({
        lat,
        lng,
        street: street,
        city: addr.city || addr.town || addr.village || "",
        state: getState(addr),
        zip: addr.postcode || "",
        timezone: tz,
      });
    } catch (error) {
      console.error("Erro ao obter morada:", error);
      onLocationSelect({ lat, lng, timezone: "UTC" });
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        getAddressDetails(lat, lng);
      },
    });

    return <Marker position={position} icon={icon} />;
  }

  function SearchField() {
    const map = useMap();

    useEffect(() => {
      // @ts-ignore: disable-next-line
      const geocoderObj =
        // @ts-ignore: disable-next-line
        Geocoder.default?.Geocoder?.nominatim() ||
        // @ts-ignore: disable-next-line
        (L.Control as any).Geocoder.nominatim();

      // @ts-ignore: disable-next-line
      const control = new (
        // @ts-ignore: disable-next-line
        Geocoder.default?.Geocoder?.control || (L.Control as any).geocoder
      )({
        query: "",
        placeholder: "Procurar rua...",
        defaultMarkGeocode: false,
        geocoder: geocoderObj,
      })
        .on("markgeocode", (e: any) => {
          const { center, properties, name } = e.geocode;
          const addr = properties?.address || {};

          // Extraímos o país do resultado da pesquisa para a timezone
          const tz = getTimezoneFromCountryCode(addr.country_code);

          // Construir morada completa - tentar múltiplos campos
          let street = "";
          
          // Tentar construir a morada completa
          if (addr.house_number && addr.road) {
            street = `${addr.road}, ${addr.house_number}`;
          } else if (addr.road) {
            street = addr.road;
          } else if (addr.hamlet || addr.suburb) {
            street = addr.hamlet || addr.suburb;
          } else {
            // Fallback: usar o primeiro elemento do display_name
            street = name || "";
            if (street.includes(",")) {
              const parts = street.split(",");
              street = parts[0].trim();
            }
          }

          // Limpar morada se muito longa
          if (street.includes(",") && street.length > 60) {
            street = street.split(",")[0].trim();
          }

          setPosition([center.lat, center.lng]);
          map.setView(center, 16);

          onLocationSelect({
            lat: center.lat,
            lng: center.lng,
            street: street,
            city: addr.city || addr.town || addr.village || "",
            state: getState(addr),
            zip: addr.postcode || "",
            timezone: tz,
          });
        })
        .addTo(map);

      return () => {
        map.removeControl(control);
      };
    }, [map]);

    return null;
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SearchField />
      <LocationMarker />
    </MapContainer>
  );
}
