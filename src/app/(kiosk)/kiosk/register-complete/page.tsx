import { redirect } from 'next/navigation'
import { RegisterCompleteClient } from '@/components/kiosk/register-complete-client'
import { headers } from 'next/headers'

interface Props {
  searchParams: Promise<{ number?: string }>
}

export default async function RegisterCompletePage({ searchParams }: Props) {
  const { number } = await searchParams
  const waitNumber = Number(number)

  if (!waitNumber) redirect('/kiosk/waiting-register')

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const statusUrl = `${protocol}://${host}/kiosk/waiting-status`

  return <RegisterCompleteClient waitNumber={waitNumber} statusUrl={statusUrl} />
}
