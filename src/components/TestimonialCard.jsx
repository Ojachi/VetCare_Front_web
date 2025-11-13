import React from 'react';

const TestimonialCard = ({ avatar, name, description, pet, role }) => (
  <div className="col s12 l6">
    <div className="card testimonial-card">
      <div className="card-content center-align">
        <img
          src={avatar}
          alt={name}
          className="circle responsive-img testimonial-avatar"
        />
        <p className="testimonial-text grey-text text-darken-2">
          {description}
        </p>
        <h6 className="grey-text text-darken-3">
          <strong>{name}{pet ? `, ${pet}` : ''}</strong>
        </h6>
        <p className="grey-text">{role}</p>
      </div>
    </div>
  </div>
);

export default TestimonialCard;