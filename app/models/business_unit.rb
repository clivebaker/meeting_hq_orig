class BusinessUnit < ApplicationRecord

  has_paper_trail

  has_many :meetings
  has_many :slide_templates
  
  validates_presence_of :name, on: [:update, :create], message: "can't be blank"
  validates_uniqueness_of :name, on: [:update, :create], message: "must be unique"

  has_many :business_unit_users #, -> {where(discarded_at: nil)}
  has_many :users, through: :business_unit_users

end
