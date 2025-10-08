"use client"


import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

type Property = {
  id: string | number
  name: string
  type?: string
  location?: string
  price?: number
  roi?: number
  image?: string
  [key: string]: any
}

type PropertiesContextValue = {
  properties: Property[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  search: (params: Record<string, any>) => Promise<Property[]>
}

const PropertiesContext = createContext<PropertiesContextValue | undefined>(undefined)

function getApiKey(): string | undefined {
  if (typeof process !== "undefined") {
    // Next.js exposes env vars prefixed with NEXT_PUBLIC_
    return process.env.NEXT_PUBLIC_API_KEY as string | undefined
  }
}

export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const apiKey = getApiKey()
    
  const fetchProperties = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/properties", {
        headers: {
          "x-api-key": apiKey || "",
        },
        cache: "no-store",
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to fetch properties: ${res.status}`)
      }
      const json = await res.json()
      console.log(json)
      const list: Property[] = json?.data?.properties || json?.data || json?.properties || []
      setProperties(Array.isArray(list) ? list : [])
      console.log(properties)
    } catch (err: any) {
      setError(err?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const search = async (params: Record<string, any>): Promise<Property[]> => {
    try {
      const url = new URL("/api/properties", typeof window !== "undefined" ? window.location.origin : "http://localhost")
      Object.entries(params || {}).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "") return
        url.searchParams.set(key, String(val))
      })
      const headers: Record<string, string> = {}
      const apiKey = getApiKey()
      if (apiKey) headers["x-api-key"] = apiKey
      const res = await fetch(url.toString(), { headers, cache: "no-store" })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const json = await res.json()
      const list: Property[] = json?.data?.properties || json?.data || json?.properties || []
      return Array.isArray(list) ? list : []
    } catch (e) {
      return []
    }
  }

  useEffect(() => {
    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<PropertiesContextValue>(() => (
    { properties, loading, error, refresh: fetchProperties, search }
  ), [properties, loading, error])

  return (
    <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>
  )
}

export function useProperties() {
  const ctx = useContext(PropertiesContext)
  if (!ctx) throw new Error("useProperties must be used within a PropertiesProvider")
  return ctx
}


