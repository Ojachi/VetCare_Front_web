// ...new file...
import React from 'react';

const ServiceCard = ({ icon = 'description', title = 'Título', description = 'Descripción' }) => (
  <div className="col s12 m4">
    <div className="card hoverable">
      <div className="card-content">
        <div className="service-icon-container center-align">
          <i className="material-icons large teal-text">{icon}</i>
        </div>
        <span className="card-title center-align grey-text text-darken-3">{title}</span>
        <p className="grey-text text-darken-1">{description}</p>
      </div>
    </div>
  </div>
);

export default ServiceCard;
// ...new file...