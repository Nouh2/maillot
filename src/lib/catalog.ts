import type { League } from '@/types/product'

export const NATIONAL_TEAMS_SLUG = 'selections-nationales'
export const NATIONAL_TEAMS_VALUE = 'Selections nationales'

export const NATIONAL_TEAMS_OPTION: League = {
  id: 'national-teams',
  slug: NATIONAL_TEAMS_SLUG,
  name: 'Selections nationales',
  country: 'International',
  flag_emoji: 'INT',
  display_order: 0,
}

export const NATIONAL_TEAMS_HREF = `/shop?league=${NATIONAL_TEAMS_SLUG}`

export function getLeagueFilterOptions(leagues: League[]): League[] {
  if (leagues.some((league) => league.slug === NATIONAL_TEAMS_SLUG)) {
    return leagues
  }

  return [NATIONAL_TEAMS_OPTION, ...leagues]
}

export function resolveLeagueFilterParam(leagueParam: string | undefined, leagues: League[]): string | undefined {
  if (!leagueParam) return undefined
  if (leagueParam === NATIONAL_TEAMS_SLUG || leagueParam === NATIONAL_TEAMS_VALUE) {
    return NATIONAL_TEAMS_VALUE
  }

  return leagues.some((league) => league.slug === leagueParam) ? leagueParam : undefined
}
