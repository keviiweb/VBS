import Image from 'next/image';
import { constants } from '../../constants';

export const Logo = (props) => (
  <div style={{width: '200px', height: '200px', position: 'relative'}}>
      <Image alt="Vercel logo" src={constants["keviilogo"]} layout='fill'/>
  </div>  
)