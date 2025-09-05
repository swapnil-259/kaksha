import {MEDIA_URLS} from '@kaksha/constants/urls';

const PROTOCOL = 'https';
const HOST = 'tech.kiet.edu';
const SUFFIX = 'api/hrms';
const MEDIA_SUFFIX = 'upload_images';

const getBaseURL = () => {
  if (__DEV__) {
    return 'https://tech.kiet.edu/api/hrms/';
  }
  return `${PROTOCOL}://${HOST}/${SUFFIX}`;
};

const getBaseMediaURL = (type: keyof typeof MEDIA_URLS) => {
  switch (type) {
    default:
      return `${PROTOCOL}://${HOST}/${MEDIA_SUFFIX}/${MEDIA_URLS[type]}/`;
  }
};

const getAvatarURL = (name?: string) => {
  return `https://ui-avatars.com/api/?name=${
    name?.split(' ').join('+') ?? 'K'
  }&background=random`;
};

export {getAvatarURL, getBaseMediaURL, getBaseURL};
