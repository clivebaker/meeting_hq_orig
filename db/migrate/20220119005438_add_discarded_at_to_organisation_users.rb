class AddDiscardedAtToOrganisationUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :organisation_users, :discarded_at, :datetime
    add_index :organisation_users, :discarded_at
  end
end
