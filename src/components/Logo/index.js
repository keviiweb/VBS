import Image from 'next/image';
import { constants } from '../../constants';

export const Logo = (props) => (
  <Image alt="Vercel logo" src={constants["keviilogo"]} />
)