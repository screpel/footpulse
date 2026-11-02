// src/services/sessionRepository.js
import { supabase } from './supabase'

export const sessionRepository = {
  async findAll() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('date_seance', { ascending: false })

    return { data: data || [], error }
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([payload])
      .select()

    return { data, error }
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('sessions')
      .update(payload)
      .eq('id', id)
      .select()

    return { data, error }
  },

  async remove(id) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)

    return { error }
  }
}
