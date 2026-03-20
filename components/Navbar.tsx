import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user?.id)
    .single()

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-blue-600">
          GlicoFamília
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">
            {profile?.name ?? user?.email}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
