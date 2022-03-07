class ChangeOrganisationId < ActiveRecord::Migration[7.0]
  def change
  
    rename_table :organisations, :business_units
    rename_column :slide_templates, :organisation_id, :business_unit_id
    rename_column :organisation_users, :organisation_id, :business_unit_id
    rename_column :meetings, :organisation_id, :business_unit_id

  end
end
