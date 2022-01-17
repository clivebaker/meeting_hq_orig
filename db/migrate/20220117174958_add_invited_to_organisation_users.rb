class AddInvitedToOrganisationUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :organisation_users, :invited, :boolean, default: false
  end
end
