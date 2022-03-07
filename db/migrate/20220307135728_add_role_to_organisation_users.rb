class AddRoleToOrganisationUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :organisation_users, :role, :jsonb, default: []
  end
end
