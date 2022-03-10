class BusinessUnit < ApplicationRecord

  has_paper_trail

  has_many :meetings
belongs_to :organisation
  
  validates_presence_of :name, on: [:update, :create], scope: :organisation_id, message: "can't be blank"
  validates_uniqueness_of :name, on: [:update, :create], scope: :organisation_id, message: "must be unique"

  has_many :business_unit_users #, -> {where(discarded_at: nil)}
  has_many :users, through: :business_unit_users

  default_scope { order(name: :asc) }


end
