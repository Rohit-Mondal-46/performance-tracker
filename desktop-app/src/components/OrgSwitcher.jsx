import React from "react";

const OrgSwitcher = ({ orgs = [], currentOrg, onChange }) => {
  return (
    <select
      value={currentOrg || ""}
      onChange={(e) => onChange(e.target.value)}
      className="border p-1 rounded"
    >
      {orgs.length === 0 ? (
        <option value="" disabled>
          No organizations available
        </option>
      ) : (
        orgs.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))
      )}
    </select>
  );
};

export default OrgSwitcher;
