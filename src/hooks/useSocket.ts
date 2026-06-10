import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { SOCKET_URL } from "@/lib/constants"

interface UseSocketOptions {
  token?: string | null
}

export const useSocket = ({ token }: UseSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const query: Record<string, string> = {}
    if (token) query.token = token

    socketRef.current = io(SOCKET_URL, {
      query,
      transports: ["websocket"],
    })

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id)
    })

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [token])

  return { socket: socketRef.current }
}
