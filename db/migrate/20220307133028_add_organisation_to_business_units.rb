class AddOrganisationToBusinessUnits < ActiveRecord::Migration[7.0]
  def change
    add_reference :business_units, :organisation, null: false, foreign_key: true
  end
end
