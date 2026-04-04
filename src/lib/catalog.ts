import type { League } from '@/types/product'

export const NATIONAL_TEAMS_SLUG = 'selections-nationales'
export const NATIONAL_TEAMS_VALUE = 'Selections nationales'
export const REST_OF_WORLD_SLUG = 'reste-du-monde'
export const REST_OF_WORLD_VALUE = 'Reste du monde'
export const CONCEPT_HREF = '/concept'

export const NATIONAL_TEAMS_OPTION: League = {
  id: 'national-teams',
  slug: NATIONAL_TEAMS_SLUG,
  name: 'Selections nationales',
  country: 'International',
  flag_emoji: 'INT',
  display_order: 0,
}

export const REST_OF_WORLD_OPTION: League = {
  id: 'rest-of-world',
  slug: REST_OF_WORLD_SLUG,
  name: REST_OF_WORLD_VALUE,
  country: 'International',
  flag_emoji: 'MONDE',
  display_order: 999,
}

export const NATIONAL_TEAMS_HREF = `/shop?league=${NATIONAL_TEAMS_SLUG}`
export const REST_OF_WORLD_HREF = `/shop?league=${REST_OF_WORLD_SLUG}`

function withSyntheticOption(leagues: League[], option: League): League[] {
  if (leagues.some((league) => league.slug === option.slug)) {
    return leagues
  }

  return [...leagues, option]
}

export function getLeagueFilterOptions(leagues: League[]): League[] {
  const withNationalTeams = leagues.some((league) => league.slug === NATIONAL_TEAMS_SLUG)
    ? leagues
    : [NATIONAL_TEAMS_OPTION, ...leagues]

  return withSyntheticOption(withNationalTeams, REST_OF_WORLD_OPTION)
}

export function getLeagueNavigationOptions(leagues: League[]): League[] {
  return withSyntheticOption(leagues, REST_OF_WORLD_OPTION)
}

export function getLeagueBySlug(slug: string, leagues: League[]): League | undefined {
  if (slug === NATIONAL_TEAMS_SLUG) return NATIONAL_TEAMS_OPTION
  if (slug === REST_OF_WORLD_SLUG) return REST_OF_WORLD_OPTION
  return leagues.find((league) => league.slug === slug)
}

export function resolveLeagueFilterParam(leagueParam: string | undefined, leagues: League[]): string | undefined {
  if (!leagueParam) return undefined
  if (leagueParam === NATIONAL_TEAMS_SLUG || leagueParam === NATIONAL_TEAMS_VALUE) {
    return NATIONAL_TEAMS_VALUE
  }
  if (leagueParam === REST_OF_WORLD_SLUG || leagueParam === REST_OF_WORLD_VALUE || leagueParam === 'A categoriser') {
    return REST_OF_WORLD_VALUE
  }

  const found = leagues.find((league) => league.slug === leagueParam)
  return found ? found.name : undefined
}

export function getLeagueDisplayName(leagueParam: string | undefined, leagues: League[]): string | undefined {
  if (!leagueParam) return undefined
  return getLeagueBySlug(leagueParam, leagues)?.name
}

export function getLeagueColor(slug: string): string {
  // Garder la couleur signature du site (Terra) pour toutes les collections
  return '#c1440e'
}
