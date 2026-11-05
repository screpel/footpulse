// src/services/clubRepository.js
import { supabase } from './supabase'

export const clubRepository = {
  async findAll() {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, nom, ville')
      .order('nom', { ascending: true })

    return { data: data || [], error }
  },

  async ensureClubsExist(entries = []) {
    const validEntries = entries
      .map(e => ({
        nom: (e?.nom || '').trim(),
        ville: (e?.ville || '').trim() || null
      }))
      .filter(e => e.nom.length > 0)

    if (validEntries.length === 0) return

    // Dédoublonnage par nom de club
    const uniqueByNom = Array.from(
      new Map(validEntries.map(item => [item.nom.toLowerCase(), item])).values()
    )

    await supabase
      .from('clubs')
      .upsert(uniqueByNom, { onConflict: 'nom', ignoreDuplicates: true })
  }
}
