import React from 'react';

import {icons} from './marker';

export default ({type, className, style}) => {
  let iconConfig = icons[type];
  if (!iconConfig) return null;
  const {imageUrl, imageSize, size, imageOffset} = iconConfig;
  return (
    <span className={['marker-icon', className].join(' ')}
          style={{
            display: 'inline-block',
            width: size.width,
            height: size.height,
            overflow: 'hidden',
            verticalAlign: 'text-bottom',
            ...style
          }}>
      <img src={imageUrl}
           style={{
             width: imageSize.width,
             height: imageSize.height,
             marginLeft: imageOffset.width,
             marginTop: imageOffset.height
           }}
      />
    </span>
  )
};
