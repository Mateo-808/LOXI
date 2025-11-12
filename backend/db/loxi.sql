-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  correo text NOT NULL UNIQUE,
  fecha_registro timestamp with time zone DEFAULT now(),
  contrasena text,
  id_auth uuid UNIQUE,
  es_admin boolean DEFAULT false CHECK (es_admin = ANY (ARRAY[true, false])),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);

CREATE TABLE public.ejercicios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  titulo text NOT NULL,
  descripcion text,
  nivel text CHECK (nivel = ANY (ARRAY['Principiante', 'Novato', 'Intermedio', 'Avanzado'])),
  tipo text CHECK (tipo = ANY (ARRAY['texto', 'opcion_multiple', 'juego'])),
  archivo text,
  CONSTRAINT ejercicios_pkey PRIMARY KEY (id)
);

CREATE TABLE public.progreso (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid,
  ejercicio_id uuid,
  completado boolean DEFAULT false,
  puntuacion integer,
  intentos integer DEFAULT 0,
  fecha timestamp without time zone DEFAULT now(),
  nivel character varying CHECK (nivel::text = ANY (ARRAY['Novato', 'Principiante', 'Intermedio', 'Avanzado'])),
  CONSTRAINT progreso_pkey PRIMARY KEY (id),
  CONSTRAINT progreso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT progreso_ejercicio_id_fkey FOREIGN KEY (ejercicio_id) REFERENCES public.ejercicios(id)
);

CREATE TABLE public.comentarios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  mensaje text,
  fecha timestamp with time zone DEFAULT now(),
  usuario_id uuid,
  CONSTRAINT comentarios_pkey PRIMARY KEY (id),
  CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
