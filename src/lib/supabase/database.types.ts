export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anios: {
        Row: {
          anio: number
          created_at: string
          id: number
        }
        Insert: {
          anio: number
          created_at?: string
          id?: number
        }
        Update: {
          anio?: number
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      concepto_pago_acceso: {
        Row: {
          acceso_tarjeta: boolean
          acceso_telefono: boolean
          concepto_pago_id: number
          created_at: string
          id: number
        }
        Insert: {
          acceso_tarjeta?: boolean
          acceso_telefono?: boolean
          concepto_pago_id: number
          created_at?: string
          id?: number
        }
        Update: {
          acceso_tarjeta?: boolean
          acceso_telefono?: boolean
          concepto_pago_id?: number
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "concepto_pago_permisos_concepto_pago_id_fkey"
            columns: ["concepto_pago_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concepto_pago_permisos_concepto_pago_id_fkey"
            columns: ["concepto_pago_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
        ]
      }
      conceptos_descuento: {
        Row: {
          created_at: string
          id: number
          monto_descuento: number
          nombre: string
        }
        Insert: {
          created_at?: string
          id?: number
          monto_descuento: number
          nombre: string
        }
        Update: {
          created_at?: string
          id?: number
          monto_descuento?: number
          nombre?: string
        }
        Relationships: []
      }
      conceptos_pago: {
        Row: {
          created_at: string
          id: number
          importe: number
          nombre: string
          tipo_pago_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          importe: number
          nombre: string
          tipo_pago_id: number
        }
        Update: {
          created_at?: string
          id?: number
          importe?: number
          nombre?: string
          tipo_pago_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "conceptos_pago_tipo_pago_id_fkey"
            columns: ["tipo_pago_id"]
            isOneToOne: false
            referencedRelation: "tipo_pago"
            referencedColumns: ["id"]
          },
        ]
      }
      conceptos_recargo: {
        Row: {
          created_at: string
          id: number
          monto_recargo: number
          nombre: string
        }
        Insert: {
          created_at?: string
          id?: number
          monto_recargo: number
          nombre: string
        }
        Update: {
          created_at?: string
          id?: number
          monto_recargo?: number
          nombre?: string
        }
        Relationships: []
      }
      cuotas: {
        Row: {
          anio: number
          concepto_id: number
          created_at: string
          domicilio_id: number
          estatus_id: number
          fecha_vencimiento: string
          id: number
          importe: number
          mes: number
        }
        Insert: {
          anio: number
          concepto_id: number
          created_at?: string
          domicilio_id: number
          estatus_id: number
          fecha_vencimiento: string
          id?: number
          importe: number
          mes: number
        }
        Update: {
          anio?: number
          concepto_id?: number
          created_at?: string
          domicilio_id?: number
          estatus_id?: number
          fecha_vencimiento?: string
          id?: number
          importe?: number
          mes?: number
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus"
            referencedColumns: ["id"]
          },
        ]
      }
      descuento_cuota: {
        Row: {
          concepto_descuento_id: number
          created_at: string
          cuota_id: number
          id: number
        }
        Insert: {
          concepto_descuento_id: number
          created_at?: string
          cuota_id: number
          id?: number
        }
        Update: {
          concepto_descuento_id?: number
          created_at?: string
          cuota_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "descuento_cuota_concepto_descuento_id_fkey"
            columns: ["concepto_descuento_id"]
            isOneToOne: false
            referencedRelation: "conceptos_descuento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descuento_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "accesos_tarjeta_info"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "descuento_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "accesos_telefono_info"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "descuento_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descuento_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "descuento_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["ultima_cuota_id"]
          },
          {
            foreignKeyName: "descuento_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["ultima_cuota_id"]
          },
        ]
      }
      domicilio_concepto: {
        Row: {
          concepto_id: number
          created_at: string
          domicilio_id: number
          id: number
        }
        Insert: {
          concepto_id: number
          created_at?: string
          domicilio_id: number
          id?: number
        }
        Update: {
          concepto_id?: number
          created_at?: string
          domicilio_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
        ]
      }
      domicilios: {
        Row: {
          created_at: string
          created_by: string
          direccion: string
          fecha_alta: string
          id: number
          observaciones: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          direccion: string
          fecha_alta: string
          id?: number
          observaciones?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          direccion?: string
          fecha_alta?: string
          id?: number
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domicilios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      estatus: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      meses: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      metodos_pago: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      movimientos_financieros: {
        Row: {
          created_at: string
          descripcion: string
          fecha_movimiento: string
          id: number
          importe: number
          metodo_pago_id: number
          referencia: string
          tipo_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          descripcion: string
          fecha_movimiento: string
          id?: number
          importe: number
          metodo_pago_id: number
          referencia?: string
          tipo_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string
          fecha_movimiento?: string
          id?: number
          importe?: number
          metodo_pago_id?: number
          referencia?: string
          tipo_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_financieros_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_movimientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          concepto_id: number | null
          created_at: string
          cuota_id: number | null
          domicilio_id: number
          fecha_pago: string
          file_data: string | null
          id: number
          importe: number
          metodo_pago_id: number
          referencia: string
          user_id: string
        }
        Insert: {
          concepto_id?: number | null
          created_at?: string
          cuota_id?: number | null
          domicilio_id: number
          fecha_pago: string
          file_data?: string | null
          id?: number
          importe: number
          metodo_pago_id: number
          referencia?: string
          user_id: string
        }
        Update: {
          concepto_id?: number | null
          created_at?: string
          cuota_id?: number | null
          domicilio_id?: number
          fecha_pago?: string
          file_data?: string | null
          id?: number
          importe?: number
          metodo_pago_id?: number
          referencia?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "accesos_tarjeta_info"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "accesos_telefono_info"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["ultima_cuota_id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["ultima_cuota_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      recargo_cuota: {
        Row: {
          concepto_recargo_id: number
          created_at: string
          cuota_id: number
          id: number
        }
        Insert: {
          concepto_recargo_id: number
          created_at?: string
          cuota_id: number
          id?: number
        }
        Update: {
          concepto_recargo_id?: number
          created_at?: string
          cuota_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "recargo_cuota_concepto_recargo_id_fkey"
            columns: ["concepto_recargo_id"]
            isOneToOne: false
            referencedRelation: "conceptos_recargo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recargo_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "accesos_tarjeta_info"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "recargo_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "accesos_telefono_info"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "recargo_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recargo_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recargo_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["ultima_cuota_id"]
          },
          {
            foreignKeyName: "recargo_cuota_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["ultima_cuota_id"]
          },
        ]
      }
      residentes: {
        Row: {
          created_at: string
          domicilio_id: number
          es_principal: boolean | null
          id: number
          nombre: string
          telefono: string | null
        }
        Insert: {
          created_at?: string
          domicilio_id: number
          es_principal?: boolean | null
          id?: number
          nombre: string
          telefono?: string | null
        }
        Update: {
          created_at?: string
          domicilio_id?: number
          es_principal?: boolean | null
          id?: number
          nombre?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: number
          role_name: string
        }
        Insert: {
          created_at?: string
          id?: number
          role_name: string
        }
        Update: {
          created_at?: string
          id?: number
          role_name?: string
        }
        Relationships: []
      }
      tarjetas_acceso: {
        Row: {
          created_at: string
          domicilio_id: number
          id: number
          numero: string
        }
        Insert: {
          created_at?: string
          domicilio_id: number
          id?: number
          numero: string
        }
        Update: {
          created_at?: string
          domicilio_id?: number
          id?: number
          numero?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarjetas_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
        ]
      }
      telefonos_acceso: {
        Row: {
          created_at: string
          domicilio_id: number
          id: number
          telefono: string
        }
        Insert: {
          created_at?: string
          domicilio_id: number
          id?: number
          telefono: string
        }
        Update: {
          created_at?: string
          domicilio_id?: number
          id?: number
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telefonos_acceso_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
        ]
      }
      tipo_pago: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      tipos_movimientos: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          role_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          role_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          user_name: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active: boolean
          user_name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          user_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      accesos_tarjeta_info: {
        Row: {
          anio: number | null
          concepto_id: number | null
          cuota_id: number | null
          direccion: string | null
          domicilio_id: number | null
          estatus_id: number | null
          mes: number | null
          tarjeta_1: string | null
          tarjeta_2: string | null
          tarjeta_3: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus"
            referencedColumns: ["id"]
          },
        ]
      }
      accesos_telefono_info: {
        Row: {
          anio: number | null
          concepto_id: number | null
          cuota_id: number | null
          direccion: string | null
          domicilio_id: number | null
          estatus_id: number | null
          mes: number | null
          telefono_1: string | null
          telefono_2: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus"
            referencedColumns: ["id"]
          },
        ]
      }
      cuotas_info: {
        Row: {
          anio: number | null
          concepto: string | null
          concepto_id: number | null
          created_at: string | null
          direccion: string | null
          domicilio_id: number | null
          estatus: string | null
          estatus_calculado: string | null
          fecha_vencimiento: string | null
          fecha_vencimiento_formated: string | null
          id: number | null
          importe_base: number | null
          importe_cuota: number | null
          mes: number | null
          monto_descuento: number | null
          monto_recargo: number | null
          periodo: string | null
          residente_principal: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
        ]
      }
      domicilio_concepto_info: {
        Row: {
          concepto_id: number | null
          concepto_nombre: string | null
          direccion: string | null
          domicilio_id: number | null
          id: number | null
          importe: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: true
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
        ]
      }
      domicilios_acceso_peatonal: {
        Row: {
          direccion: string | null
          estado: string | null
          fecha_alta: string | null
          fecha_vencimiento: string | null
          id: number | null
          id_concepto: number | null
          importe: number | null
          observaciones: string | null
          residente_principal: string | null
          tipo_acceso: string | null
          tipo_cuota: string | null
          ultima_cuota_anio: number | null
          ultima_cuota_id: number | null
          ultima_cuota_mes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["id_concepto"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["id_concepto"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
        ]
      }
      domicilios_info: {
        Row: {
          acceso_tarjeta: boolean | null
          acceso_telefono: boolean | null
          direccion: string | null
          estatus: string | null
          fecha_alta: string | null
          id: number | null
          id_concepto: number | null
          observaciones: string | null
          residente_principal: string | null
          tipo_cuota: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["id_concepto"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["id_concepto"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
        ]
      }
      domicilios_morosos: {
        Row: {
          direccion: string | null
          estado: string | null
          fecha_alta: string | null
          fecha_vencimiento: string | null
          id: number | null
          id_concepto: number | null
          importe: number | null
          observaciones: string | null
          residente_principal: string | null
          tipo_acceso: string | null
          tipo_cuota: string | null
          ultima_cuota_anio: number | null
          ultima_cuota_id: number | null
          ultima_cuota_mes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["id_concepto"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilio_concepto_concepto_id_fkey"
            columns: ["id_concepto"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
        ]
      }
      domicilios_tarjetas_acceso: {
        Row: {
          anio: number | null
          direccion: string | null
          domicilio_id: number | null
          estatus_id: number | null
          mes: number | null
          tarjeta: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus"
            referencedColumns: ["id"]
          },
        ]
      }
      domicilios_telefonos_acceso: {
        Row: {
          anio: number | null
          direccion: string | null
          domicilio_id: number | null
          estatus_id: number | null
          mes: number | null
          telefono: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_estatus_id_fkey"
            columns: ["estatus_id"]
            isOneToOne: false
            referencedRelation: "estatus"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_info: {
        Row: {
          created_at: string | null
          descripcion: string | null
          fecha_movimiento: string | null
          id: number | null
          importe: number | null
          metodo_pago: string | null
          metodo_pago_id: number | null
          referencia: string | null
          tipo_id: number | null
          tipo_movimiento: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_financieros_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_movimientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_info: {
        Row: {
          anio: number | null
          concepto: string | null
          concepto_id: number | null
          created_at: string | null
          cuota_id: number | null
          direccion: string | null
          domicilio_id: number | null
          fecha_pago: string | null
          file_data: string | null
          id: number | null
          importe: number | null
          mes: number | null
          metodo_pago: string | null
          metodo_pago_id: number | null
          referencia: string | null
          tipo_pago_id: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conceptos_pago_tipo_pago_id_fkey"
            columns: ["tipo_pago_id"]
            isOneToOne: false
            referencedRelation: "tipo_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "accesos_tarjeta_info"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "accesos_telefono_info"
            referencedColumns: ["cuota_id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["ultima_cuota_id"]
          },
          {
            foreignKeyName: "pagos_cuota_id_fkey"
            columns: ["cuota_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["ultima_cuota_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      recibos_info: {
        Row: {
          concepto_id: number | null
          concepto_nombre: string | null
          created_at: string | null
          direccion: string | null
          domicilio_id: number | null
          fecha_pago: string | null
          id: number | null
          importe: number | null
          metodo_pago_id: number | null
          referencia: string | null
          residente_principal: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "conceptos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_concepto_id_fkey"
            columns: ["concepto_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["concepto_id"]
          },
          {
            foreignKeyName: "pagos_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
        ]
      }
      reporte_egresos_mensual: {
        Row: {
          anio: number | null
          descripcion: string | null
          fecha_movimiento: string | null
          fecha_registro: string | null
          importe: number | null
          mes: number | null
          metodo_pago_id: number | null
          movimiento_id: number | null
          periodo: string | null
          referencia: string | null
          user_id: string | null
        }
        Insert: {
          anio?: never
          descripcion?: string | null
          fecha_movimiento?: string | null
          fecha_registro?: string | null
          importe?: number | null
          mes?: never
          metodo_pago_id?: number | null
          movimiento_id?: number | null
          periodo?: never
          referencia?: string | null
          user_id?: string | null
        }
        Update: {
          anio?: never
          descripcion?: string | null
          fecha_movimiento?: string | null
          fecha_registro?: string | null
          importe?: number | null
          mes?: never
          metodo_pago_id?: number | null
          movimiento_id?: number | null
          periodo?: never
          referencia?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_financieros_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_financieros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      reporte_pagos_detalle: {
        Row: {
          domicilio_id: number | null
          fecha_pago: string | null
          file_data: string | null
          id: number | null
          importe: number | null
          metodo_pago_id: number | null
          metodo_pago_nombre: string | null
          nombre_usuario: string | null
          referencia: string | null
          user_id: string | null
          usuario: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "pagos_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      reporte_pagos_mensual: {
        Row: {
          anio: number | null
          concepto: string | null
          concepto_id: number | null
          direccion: string | null
          domicilio_id: number | null
          fecha_movimiento: string | null
          fecha_pago: string | null
          importe: number | null
          mes: number | null
          metodo_pago_id: number | null
          movimiento_descripcion: string | null
          movimiento_id: number | null
          pago_id: number | null
          periodo: string | null
          referencia: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_metodo_pago_id_fkey"
            columns: ["metodo_pago_id"]
            isOneToOne: false
            referencedRelation: "metodos_pago"
            referencedColumns: ["id"]
          },
        ]
      }
      reporte_pagos_por_usuario: {
        Row: {
          email: string | null
          nombre_usuario: string | null
          primer_pago: string | null
          total_cobrado: number | null
          total_pagos: number | null
          ultimo_pago: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      residentes_info: {
        Row: {
          created_at: string | null
          direccion: string | null
          domicilio_id: number | null
          es_principal: boolean | null
          id: number | null
          nombre: string | null
          telefono: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_acceso_peatonal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_morosos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_tarjetas_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "domicilios_telefonos_acceso"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "recibos_info"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "reporte_pagos_mensual"
            referencedColumns: ["domicilio_id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_residente_principal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residentes_domicilio_id_fkey"
            columns: ["domicilio_id"]
            isOneToOne: false
            referencedRelation: "vw_domicilios_tarjetas"
            referencedColumns: ["domicilio_id"]
          },
        ]
      }
      resumen_financiero_completo: {
        Row: {
          egresos_mes: number | null
          egresos_mes_anterior: number | null
          ingresos_mes: number | null
          ingresos_mes_anterior: number | null
          saldo_actual: number | null
          total_egresos: number | null
          total_ingresos: number | null
        }
        Relationships: []
      }
      users_info: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          role_id: number | null
          role_name: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_domicilios_residente_principal: {
        Row: {
          created_at: string | null
          created_by: string | null
          direccion: string | null
          fecha_alta: string | null
          id: number | null
          observaciones: string | null
          residente: string | null
          telefono: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domicilios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domicilios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_info"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_domicilios_tarjetas: {
        Row: {
          direccion: string | null
          domicilio_id: number | null
          tarjeta_1: string | null
          tarjeta_2: string | null
          tarjeta_3: string | null
          tarjeta_4: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generar_cuotas: {
        Args: { p_anio: number; p_mes: number }
        Returns: undefined
      }
      marcar_cuotas_vencidas: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
