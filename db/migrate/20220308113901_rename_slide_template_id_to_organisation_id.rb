class RenameSlideTemplateIdToOrganisationId < ActiveRecord::Migration[7.0]
  def change


    rename_column :slide_templates, :business_unit_id, :organisation_id


  end
end
