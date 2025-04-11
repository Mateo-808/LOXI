//IMPORTAMOS LA LIBRERIA DE SUPABASE DE JS
import { createClient } from '@supabase/supabase-js'

//TOMAMOS LAS VARIABLES DE ENTORNO DE SUPABASE DEL ARCHIVO .env 
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

//HACEMOS LA CONEXION A LA BASE DE DATOS
//CREANDO EL CLIENTE DE SUPABASE
export const supabase = createClient(supabaseUrl, supabaseKey)