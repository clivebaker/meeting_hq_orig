class RenameOrganisationUsers < ActiveRecord::Migration[7.0]
  def change

    rename_table :organisation_users, :business_unit_users
  

  end
end
