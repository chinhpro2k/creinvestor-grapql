import { get } from 'lodash';
import { Country, RawOrgUser } from 'types/setting';

export function getCountryName(countries: Country[], code: string) {
  const filterCountries = countries.filter(
    (item) => get(item, 'code') === code
  );
  return get(filterCountries, '[0].name', '');
}

export function getCountryCode(countries: Country[], name: string) {
  const filterCountries = countries.filter(
    (item) => get(item, 'name') === name
  );
  return get(filterCountries, '[0].code', '');
}

export function getOrgUserFullName(
  user: RawOrgUser,
  userId: string,
  suffixText: string
): string {
  return (
    get(user, 'first_name') +
    (get(user, 'last_name') ? ' ' + get(user, 'last_name') : '') +
    (userId === get(user, 'id') ? ' ' + suffixText : '')
  );
}

export function deleteUserFromList(
  users: RawOrgUser[],
  userId: string
): RawOrgUser[] {
  const newUsers: RawOrgUser[] = [];
  users.forEach((user) => {
    if (user.id != userId) {
      newUsers.push(user);
    }
  });
  return newUsers;
}

export function checkShowLimitSendInviteEmails(
  formik,
  list: RawOrgUser[],
  limit: number
) {
  if (
    !formik.errors.invitingEmails &&
    formik.values.invitingEmails &&
    (formik.values.invitingEmails as string).split(',').length + list.length >=
      limit
  ) {
    return true;
  }
  return false;
}
