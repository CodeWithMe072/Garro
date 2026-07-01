import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceSelection = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would gather the form data and pass it to the search page or API
    // For now, just navigate to the GarageList (search page)
    navigate('/garages');
  };

  return (
    <section className="gq-page">
      <div className="container">
        <h1 className="gq-title">Get Instant Quotes from <span>Top-Rated Garages</span></h1>
        <p className="gq-sub">Transparent pricing <span>·</span> Verified garages <span>·</span> Instant quotes</p>

        <div className="gq-form-wrap">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Service Category + Sub-Category */}
            <div className="gq-row gq-row-2">
              <div>
                <div className="gq-label"><span className="material-icons-round">search</span> Service Category</div>
                <select name="category" className="gq-select" required defaultValue="">
                  <option value="">Select main category</option>
                  <option value="major_minor">Major &amp; Minor Fixes</option>
                  <option value="diagnostics">Diagnostics &amp; Inspections</option>
                  <option value="aesthetics">Aesthetics &amp; Detailing</option>
                  <option value="insurance">Insurance &amp; Protection</option>
                  <option value="roadside">Roadside Assistance</option>
                  <option value="eol">End-of-Life &amp; Scrap</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">list</span> Sub-Category</div>
                <select name="sub_category" className="gq-select" defaultValue="">
                  <option value="">Select sub-category</option>
                  <option value="oil_change">Oil Change</option>
                  <option value="brake_repair">Brake Repair</option>
                  <option value="battery">Battery Replacement</option>
                  <option value="engine">Engine Repair</option>
                  <option value="tyre">Tyre Replacement</option>
                  <option value="ac">AC Service</option>
                  <option value="suspension">Suspension Fix</option>
                  <option value="full_detailing">Full Detailing</option>
                  <option value="towing">Towing Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 2: Brand, Model, Year, City, Area */}
            <div className="gq-row gq-row-5">
              <div>
                <div className="gq-label"><span className="material-icons-round">directions_car</span> Brand</div>
                <select name="car_brand" className="gq-select" defaultValue="">
                  <option value="">Select Brand</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Honda">Honda</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Audi">Audi</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Land Rover">Land Rover</option>
                  <option value="Lexus">Lexus</option>
                  <option value="Ford">Ford</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">tune</span> Model</div>
                <input type="text" name="car_model_name" className="gq-input" placeholder="Any Model" />
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">calendar_today</span> Year</div>
                <select name="car_year" className="gq-select" defaultValue="">
                  <option value="">Year</option>
                  {[...Array(20)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">location_city</span> City</div>
                <select name="city" className="gq-select" defaultValue="">
                  <option value="">City</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                </select>
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">location_on</span> Area</div>
                <input type="text" name="user_location" className="gq-input" placeholder="Area" />
              </div>
            </div>

            {/* Row 3: Issue, Contact, Preferred Time, Submit */}
            <div className="gq-row gq-row-4">
              <div>
                <div className="gq-label"><span className="material-icons-round">description</span> Describe Your Issue</div>
                <input type="text" name="problem_title" className="gq-input" placeholder="Describe the issue" required />
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">phone</span> Contact Info</div>
                <input type="tel" name="phone" className="gq-input" placeholder="Enter mobile number" />
              </div>
              <div>
                <div className="gq-label"><span className="material-icons-round">access_time</span> Preferred Time</div>
                <select name="urgency" className="gq-select" defaultValue="flexible">
                  <option value="asap">ASAP — Urgent</option>
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn-gq-submit">Get a Quote</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ServiceSelection;
