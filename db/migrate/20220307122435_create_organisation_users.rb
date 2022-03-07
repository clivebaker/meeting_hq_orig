class CreateOrganisationUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :organisation_users do |t|
      t.references :user, null: false, foreign_key: true
      t.references :organisation, null: false, foreign_key: true
      t.boolean :invited
      t.datetime :discarded

      t.timestamps
    end
  end
end
