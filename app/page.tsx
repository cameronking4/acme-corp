import { redirect } from 'next/navigation'
import { getAuth } from '@/lib/auth'

export default async function Home() {
  const session = await getAuth()

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
